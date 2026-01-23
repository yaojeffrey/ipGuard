chrome.runtime.onInstalled.addListener(async () => {
  const { checkInterval } = await chrome.storage.local.get(['checkInterval']);
  const minutes = checkInterval || 2;
  chrome.alarms.create('checkIP', { periodInMinutes: minutes });
  chrome.action.setBadgeText({ text: '' });
  // Perform immediate check on install
  await performIPCheck();
});

// Recreate alarm and check on browser startup
chrome.runtime.onStartup.addListener(async () => {
  const { checkInterval } = await chrome.storage.local.get(['checkInterval']);
  const minutes = checkInterval || 2;
  chrome.alarms.create('checkIP', { periodInMinutes: minutes });
  // Perform immediate check on startup
  await performIPCheck();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkIP') {
    await performIPCheck();
  }
});

// Listen for interval updates from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateInterval') {
    chrome.alarms.clear('checkIP', () => {
      chrome.alarms.create('checkIP', { periodInMinutes: request.interval });
    });
    sendResponse({ success: true });
  }
  return true;
});

// IP validation and utility functions
function isValidIPv4(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

function isValidIPv6(ip) {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(ip);
}

function normalizeIPv6(ip) {
  if (!isValidIPv6(ip)) return ip;
  return ip.toLowerCase().replace(/\b0+(\w)/g, '$1');
}

function ipv4ToInt(ip) {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isIpv4InCIDR(ip, cidr) {
  const [network, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  if (!isValidIPv4(network) || prefix < 0 || prefix > 32) return false;
  const ipInt = ipv4ToInt(ip);
  const networkInt = ipv4ToInt(network);
  const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
  return (ipInt & mask) === (networkInt & mask);
}

function parseIpv4Range(range) {
  const parts = range.split('-').map(p => p.trim());
  if (parts.length !== 2) return null;
  let startIp, endIp;
  if (!parts[1].includes('.')) {
    const baseIp = parts[0].split('.');
    if (baseIp.length !== 4) return null;
    startIp = parts[0];
    endIp = `${baseIp[0]}.${baseIp[1]}.${baseIp[2]}.${parts[1]}`;
  } else {
    startIp = parts[0];
    endIp = parts[1];
  }
  if (!isValidIPv4(startIp) || !isValidIPv4(endIp)) return null;
  return { start: ipv4ToInt(startIp), end: ipv4ToInt(endIp) };
}

function isIpv4InRange(ip, range) {
  const ipInt = ipv4ToInt(ip);
  const parsed = parseIpv4Range(range);
  if (!parsed) return false;
  return ipInt >= parsed.start && ipInt <= parsed.end;
}

function isIpv6InCIDR(ip, cidr) {
  const [network, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  if (!isValidIPv6(network) || prefix < 0 || prefix > 128) return false;
  const normalizedIp = normalizeIPv6(ip);
  const normalizedNetwork = normalizeIPv6(network);
  const ipParts = normalizedIp.split(':');
  const netParts = normalizedNetwork.split(':');
  const fullGroups = Math.floor(prefix / 16);
  for (let i = 0; i < fullGroups; i++) {
    if (ipParts[i] !== netParts[i]) return false;
  }
  if (prefix % 16 !== 0) {
    const partialBits = prefix % 16;
    const ipHex = parseInt(ipParts[fullGroups] || '0', 16);
    const netHex = parseInt(netParts[fullGroups] || '0', 16);
    const mask = (0xFFFF << (16 - partialBits)) & 0xFFFF;
    if ((ipHex & mask) !== (netHex & mask)) return false;
  }
  return true;
}

function isIpMatch(currentIp, targetSpec, isIPv6 = false) {
  if (!currentIp || !targetSpec) return false;
  switch (targetSpec.type) {
    case 'none':
      return false;
    case 'cidr':
      return isIPv6 ? isIpv6InCIDR(currentIp, targetSpec.value) : isIpv4InCIDR(currentIp, targetSpec.value);
    case 'range':
      return isIpv4InRange(currentIp, targetSpec.value);
    case 'list':
      if (isIPv6) {
        const normalizedCurrent = normalizeIPv6(currentIp);
        const normalizedTargets = targetSpec.value.map(ip => normalizeIPv6(ip));
        return normalizedTargets.includes(normalizedCurrent);
      } else {
        return targetSpec.value.includes(currentIp);
      }
    default:
      return false;
  }
}

async function getIPv4(apiChoice = 'ipify') {
  const apis = {
    ipify: {
      url: 'https://api.ipify.org?format=json',
      parse: (data) => JSON.parse(data).ip
    },
    icanhazip: {
      url: 'https://icanhazip.com',
      parse: (data) => data.trim()
    },
    myip: {
      url: 'https://api.my-ip.io/v2/ip.json',
      parse: (data) => JSON.parse(data).ip
    }
  };
  
  const api = apis[apiChoice] || apis.ipify;
  
  try {
    const response = await fetch(api.url);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.text();
    return api.parse(data);
  } catch (e) {
    if (apiChoice !== 'ipify') {
      const fallback = await fetch('https://api.ipify.org?format=text');
      if (fallback.ok) {
        return (await fallback.text()).trim();
      }
    }
    throw e;
  }
}

async function getIPv6() {
  try {
    const response = await fetch('https://api64.ipify.org?format=json');
    if (!response.ok) throw new Error('IPv6 API request failed');
    const data = await response.json();
    return isValidIPv6(data.ip) ? data.ip : null;
  } catch (e) {
    return null;
  }
}

async function getIPv4(apiChoice = 'ipify') {
  const apis = {
    ipify: {
      url: 'https://api.ipify.org?format=json',
      parse: (data) => JSON.parse(data).ip
    },
    icanhazip: {
      url: 'https://icanhazip.com',
      parse: (data) => data.trim()
    },
    myip: {
      url: 'https://api.my-ip.io/v2/ip.json',
      parse: (data) => JSON.parse(data).ip
    }
  };
  
  const api = apis[apiChoice] || apis.ipify;
  
  try {
    const response = await fetch(api.url);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.text();
    return api.parse(data);
  } catch (e) {
    if (apiChoice !== 'ipify') {
      const fallback = await fetch('https://api.ipify.org?format=text');
      if (fallback.ok) {
        return (await fallback.text()).trim();
      }
    }
    throw e;
  }
}

async function getIPv6() {
  try {
    const response = await fetch('https://api64.ipify.org?format=json');
    if (!response.ok) throw new Error('IPv6 API request failed');
    const data = await response.json();
    return isValidIPv6(data.ip) ? data.ip : null;
  } catch (e) {
    return null;
  }
}

async function performIPCheck() {
  try {
    const { targetIpv4, targetIpv6, apiChoice } = await chrome.storage.local.get(['targetIpv4', 'targetIpv6', 'apiChoice']);

    let currentIpv4 = null;
    let currentIpv6 = null;

    try {
      currentIpv4 = await getIPv4(apiChoice || 'ipify');
    } catch (e) {
      // IPv4 check failed
    }

    try {
      const ipv6 = await getIPv6();
      if (ipv6) {
        currentIpv6 = normalizeIPv6(ipv6);
      }
    } catch (e) {
      // IPv6 check failed
    }

    const issues = [];
    
    // Check IPv4 with CIDR/range support
    const ipv4Spec = targetIpv4 || { type: 'none', value: null };
    if (ipv4Spec.type !== 'none') {
      if (!currentIpv4 || !isIpMatch(currentIpv4, ipv4Spec, false)) {
        issues.push('ipv4');
      }
    } else {
      if (currentIpv4) {
        issues.push('ipv4-leak');
      }
    }
    
    // Check IPv6 with CIDR support
    const ipv6Spec = targetIpv6 || { type: 'none', value: null };
    if (ipv6Spec.type !== 'none') {
      if (!currentIpv6 || !isIpMatch(currentIpv6, ipv6Spec, true)) {
        issues.push('ipv6');
      }
    } else {
      if (currentIpv6) {
        issues.push('ipv6-leak');
      }
    }
    
    // Set badge
    if (issues.length === 0) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
    } else if (issues.some(i => i.includes('leak'))) {
      chrome.action.setBadgeText({ text: '⚠' });
      chrome.action.setBadgeBackgroundColor({ color: '#f39c12' });
    } else {
      chrome.action.setBadgeText({ text: '✗' });
      chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
    }
    
    const now = new Date().toLocaleTimeString();
    await chrome.storage.local.set({ 
      lastCheck: now, 
      lastIpv4: currentIpv4,
      lastIpv6: currentIpv6
    });
    
  } catch (error) {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#f39c12' });
  }
}


chrome.action.onClicked.addListener(() => {
  performIPCheck();
});
