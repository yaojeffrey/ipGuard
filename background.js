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

// Listen for interval updates and manual check requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateInterval') {
    chrome.alarms.clear('checkIP', () => {
      chrome.alarms.create('checkIP', { periodInMinutes: request.interval });
    });
    sendResponse({ success: true });
  } else if (request.action === 'checkIP') {
    // Trigger IP check from popup
    performIPCheck().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
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
      parse: (data) => {
        const json = JSON.parse(data);
        return { ip: json.ip, isp: null, country: null, city: null };
      }
    },
    cloudflare: {
      url: 'https://1.1.1.1/cdn-cgi/trace',
      parse: (data) => {
        const ip = data.split('\n').find(line => line.startsWith('ip=')).split('=')[1];
        return { ip: ip, isp: null, country: null, city: null };
      }
    },
    amazonaws: {
      url: 'https://checkip.amazonaws.com',
      parse: (data) => {
        return { ip: data.trim(), isp: null, country: null, city: null };
      }
    },
    ipinfo: {
      url: 'https://ipinfo.io/json',
      parse: (data) => {
        const json = JSON.parse(data);
        return {
          ip: json.ip,
          isp: json.org || null,
          country: json.country || null,
          city: json.city || null
        };
      }
    },
    ipapi: {
      url: 'https://ipapi.co/json/',
      parse: (data) => {
        const json = JSON.parse(data);
        return {
          ip: json.ip,
          isp: json.org || null,
          country: json.country_name || null,
          city: json.city || null
        };
      }
    },
    icanhazip: {
      url: 'https://icanhazip.com',
      parse: (data) => {
        return { ip: data.trim(), isp: null, country: null, city: null };
      }
    },
    myip: {
      url: 'https://api.my-ip.io/v2/ip.json',
      parse: (data) => {
        const json = JSON.parse(data);
        return { ip: json.ip, isp: null, country: null, city: null };
      }
    }
  };

  // Smart fallback chain: try geo-enabled APIs first, then basic ones
  const fallbackChain = ['ipinfo', 'ipapi', 'ipify'];

  // Remove primary choice from fallback chain
  const filteredFallbacks = fallbackChain.filter(name => name !== apiChoice);

  // Try primary API first
  const primaryApi = apis[apiChoice] || apis.ipify;

  try {
    console.log(`🌐 Trying primary API: ${apiChoice}`);
    const response = await fetch(primaryApi.url);
    if (!response.ok) {
      console.warn(`⚠️ Primary API ${apiChoice} failed with status: ${response.status}`);
      throw new Error(`API request failed: ${response.status}`);
    }
    const data = await response.text();
    const result = primaryApi.parse(data);
    console.log(`✅ Primary API ${apiChoice} succeeded:`, result);
    return result;
  } catch (primaryError) {
    console.error(`❌ Primary API ${apiChoice} error:`, primaryError.message);

    // Try fallback chain
    for (const fallbackName of filteredFallbacks) {
      try {
        console.log(`🔄 Trying fallback API: ${fallbackName}`);
        const fallbackApi = apis[fallbackName];
        const response = await fetch(fallbackApi.url);

        if (!response.ok) {
          console.warn(`⚠️ Fallback API ${fallbackName} failed with status: ${response.status}`);
          continue; // Try next fallback
        }

        const data = await response.text();
        const result = fallbackApi.parse(data);
        console.log(`✅ Fallback API ${fallbackName} succeeded:`, result);
        console.log(`ℹ️ Note: Using fallback ${fallbackName} instead of ${apiChoice}`);
        return result;
      } catch (fallbackError) {
        console.error(`❌ Fallback API ${fallbackName} error:`, fallbackError.message);
        continue; // Try next fallback
      }
    }

    // All APIs failed
    console.error('❌ All API attempts failed');
    throw new Error('All IP detection APIs failed');
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

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function checkDNSLeak(dnsServers, currentCountry) {
  if (!dnsServers || dnsServers.length === 0) {
    return null; // Couldn't determine
  }

  // If no country data, we can't compare locations
  if (!currentCountry) {
    console.log('ℹ️ No IP location data available - DNS leak test inconclusive');
    return null; // Can't determine without location data
  }

  // Known public DNS services (not leaks)
  const publicDNS = [
    '1.1.1.1', '1.0.0.1',           // Cloudflare
    '8.8.8.8', '8.8.4.4',           // Google
    '9.9.9.9',                       // Quad9
    '208.67.222.222', '208.67.220.220' // OpenDNS
  ];

  // Check if any DNS server is in different country than IP
  const leakingServers = dnsServers.filter(server => {
    // Skip if it's a known public DNS
    if (publicDNS.includes(server.ip_address)) {
      return false;
    }

    // Check if country doesn't match (case insensitive)
    // currentCountry could be "US" or "United States" depending on API
    const serverCountry = server.country || '';
    const normalizedCurrent = currentCountry?.toLowerCase() || '';
    const normalizedServer = serverCountry.toLowerCase();

    // Check both country code and full name
    return normalizedCurrent && normalizedServer &&
           !normalizedCurrent.includes(normalizedServer) &&
           !normalizedServer.includes(normalizedCurrent);
  });

  return leakingServers.length > 0;
}

async function performDNSLeakTest(currentCountry) {
  try {
    // Generate 5 unique test IDs
    const testIDs = Array.from({ length: 5 }, () => generateUUID());

    // Step 1: Register test IDs
    console.log('🔍 Registering DNS test IDs...');
    await fetch('https://www.dnsleaktest.com/api/v1/identifiers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'User-Agent': 'IPGuard/1.4.0'
      },
      body: JSON.stringify({ identifiers: testIDs })
    });

    // Step 2: Trigger DNS queries by fetching unique subdomains
    console.log('🔍 Triggering DNS queries...');
    await Promise.all(
      testIDs.map(id =>
        fetch(`https://${id}.test.dnsleaktest.com/`, {
          method: 'HEAD',
          cache: 'no-store'
        }).catch(() => {}) // Ignore errors, we just need DNS resolution
      )
    );

    // Wait 2 seconds for DNS propagation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Get results
    console.log('🔍 Retrieving DNS test results...');
    const resultsResponse = await fetch('https://www.dnsleaktest.com/api/v1/servers-for-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'User-Agent': 'IPGuard/1.4.0'
      },
      body: JSON.stringify({ queries: testIDs })
    });

    if (!resultsResponse.ok) {
      throw new Error(`DNS leak test failed with status: ${resultsResponse.status}`);
    }

    const dnsServers = await resultsResponse.json();

    // Step 4: Analyze for leaks
    const isDNSLeak = checkDNSLeak(dnsServers, currentCountry);

    return { isDNSLeak, dnsServers };

  } catch (error) {
    console.error('❌ DNS leak test error:', error);
    return { isDNSLeak: null, dnsServers: [] }; // null = couldn't test
  }
}

async function performIPCheck() {
  try {
    const { targetIpv4, targetIpv6, apiChoice, lastStatus, lastIpv4, lastIpv6 } = await chrome.storage.local.get(['targetIpv4', 'targetIpv6', 'apiChoice', 'lastStatus', 'lastIpv4', 'lastIpv6']);

    let currentIpv4 = null;
    let currentIpv6 = null;
    let ipv4Isp = null;
    let ipv4Country = null;
    let ipv4City = null;

    try {
      const ipv4Data = await getIPv4(apiChoice || 'ipinfo');
      currentIpv4 = ipv4Data.ip;
      ipv4Isp = ipv4Data.isp;
      ipv4Country = ipv4Data.country;
      ipv4City = ipv4Data.city;
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

    // DNS Leak Check - Only run on IP change or first run
    const ipChanged = (lastIpv4 && lastIpv4 !== currentIpv4) ||
                      (lastIpv6 && lastIpv6 !== currentIpv6);
    const isFirstRun = !lastIpv4 && !lastIpv6;

    let dnsLeakResult = { isDNSLeak: null, dnsServers: [] };

    if (isFirstRun || ipChanged) {
      console.log('🔍 IP changed or first run, performing DNS leak test...');
      dnsLeakResult = await performDNSLeakTest(ipv4Country);

      if (dnsLeakResult.isDNSLeak === true) {
        issues.push('dns-leak');
        console.warn('⚠️ DNS leak detected!', dnsLeakResult.dnsServers);
      } else if (dnsLeakResult.isDNSLeak === false) {
        console.log('✅ No DNS leak detected');
      } else {
        console.log('ℹ️ DNS leak test inconclusive');
      }
    }

    // Determine new status
    let newStatus;
    if (issues.length === 0) {
      newStatus = 'success';
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
    } else if (issues.some(i => i.includes('leak'))) {
      newStatus = 'warning';
      chrome.action.setBadgeText({ text: '⚠' });
      chrome.action.setBadgeBackgroundColor({ color: '#f39c12' });
    } else {
      newStatus = 'error';
      chrome.action.setBadgeText({ text: '✗' });
      chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
    }

    // Check for status change and send notification
    if (lastStatus && lastStatus !== newStatus) {
      await sendStatusChangeNotification(newStatus, currentIpv4, currentIpv6, issues);
    }

    const now = new Date().toLocaleTimeString();
    await chrome.storage.local.set({
      lastCheck: now,
      lastIpv4: currentIpv4,
      lastIpv6: currentIpv6,
      lastStatus: newStatus,
      lastIpv4Isp: ipv4Isp,
      lastIpv4Country: ipv4Country,
      lastIpv4City: ipv4City,
      lastDNSServers: dnsLeakResult.dnsServers,
      lastDNSLeakStatus: dnsLeakResult.isDNSLeak
    });

    // Detect if anything changed from previous check
    const statusChanged = lastStatus && lastStatus !== newStatus;
    const ipv4Changed = lastIpv4 && lastIpv4 !== currentIpv4;
    const ipv6Changed = lastIpv6 && lastIpv6 !== currentIpv6;
    const somethingChanged = statusChanged || ipv4Changed || ipv6Changed;

    // Get existing history to check if empty
    const { ipCheckHistory } = await chrome.storage.local.get(['ipCheckHistory']);
    const history = ipCheckHistory || [];
    const historyIsEmpty = history.length === 0;

    // Only log history if: status/IP changed, first run, or history is empty
    if (!lastStatus || somethingChanged || historyIsEmpty) {
      // Determine why we're logging this entry
      let changeReason;
      if (!lastStatus || historyIsEmpty) {
        changeReason = 'initial';
      } else if (statusChanged && (ipv4Changed || ipv6Changed)) {
        changeReason = 'both';
      } else if (statusChanged) {
        changeReason = 'status';
      } else {
        changeReason = 'ip';
      }

      const historyEntry = {
        timestamp: new Date().toISOString(),
        displayTime: now,
        ipv4: currentIpv4 || 'N/A',
        ipv6: currentIpv6 || 'N/A',
        status: newStatus,
        hasChanged: ipv4Changed || ipv6Changed,
        changeReason: changeReason
      };

      // Add new entry at beginning
      history.unshift(historyEntry);

      // Filter: keep only last 24 hours + max 100 entries
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const filtered = history
        .filter(entry => new Date(entry.timestamp) > twentyFourHoursAgo)
        .slice(0, 100);

      // Save filtered history
      await chrome.storage.local.set({ ipCheckHistory: filtered });
    }

  } catch (error) {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#f39c12' });
  }
}


async function sendStatusChangeNotification(newStatus, currentIpv4, currentIpv6, issues) {
  // Check if notifications are enabled
  const { notificationsEnabled } = await chrome.storage.local.get(['notificationsEnabled']);
  if (!notificationsEnabled) return;

  let title, message, iconUrl;

  if (newStatus === 'success') {
    title = '✓ IP Guard - Status Recovered';
    message = 'Your IP address now matches the target configuration.';
    iconUrl = 'icons/icon128.png';
  } else if (newStatus === 'warning') {
    title = '⚠ IP Guard - Leak Detected';
    message = issues.join('\n');
    iconUrl = 'icons/icon128.png';
  } else if (newStatus === 'error') {
    title = '✗ IP Guard - IP Mismatch';
    message = issues.join('\n');
    iconUrl = 'icons/icon128.png';
  } else {
    return; // Don't notify for 'checking' status
  }

  if (currentIpv4) message += `\nIPv4: ${currentIpv4}`;
  if (currentIpv6) message += `\nIPv6: ${currentIpv6}`;

  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconUrl,
    title: title,
    message: message,
    priority: 2
  });
}

chrome.action.onClicked.addListener(() => {
  performIPCheck();
});
