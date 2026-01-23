const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const currentIpElement = document.getElementById('currentIp');
const statusMessage = document.getElementById('statusMessage');
const saveNotification = document.getElementById('saveNotification');
const targetIpv4Input = document.getElementById('targetIpv4Input');
const targetIpv6Input = document.getElementById('targetIpv6Input');
const apiSelect = document.getElementById('apiSelect');
const checkInterval = document.getElementById('checkInterval');
const notificationsToggle = document.getElementById('notificationsToggle');
const saveButton = document.getElementById('saveButton');
const checkButton = document.getElementById('checkButton');
const lastCheckElement = document.getElementById('lastCheck');
const historyList = document.getElementById('historyList');
const exportCsvButton = document.getElementById('exportCsvButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');

function showNotification(message, type = 'success') {
  saveNotification.textContent = message;
  saveNotification.className = `save-notification ${type} show`;
  setTimeout(() => {
    saveNotification.classList.remove('show');
  }, 3000);
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
    },
    ipapi: {
      url: 'https://ipapi.co/json/',
      parse: (data) => JSON.parse(data).ip
    },
    ipinfo: {
      url: 'https://ipinfo.io/json',
      parse: (data) => JSON.parse(data).ip
    },
    cloudflare: {
      url: 'https://1.1.1.1/cdn-cgi/trace',
      parse: (data) => {
        const match = data.match(/ip=([^\n]+)/);
        return match ? match[1] : null;
      }
    },
    amazonaws: {
      url: 'https://checkip.amazonaws.com',
      parse: (data) => data.trim()
    }
  };
  
  const api = apis[apiChoice] || apis.ipify;
  
  try {
    const response = await fetch(api.url);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.text();
    return api.parse(data);
  } catch (e) {
    // Fallback chain: try multiple alternatives
    const fallbacks = ['cloudflare', 'ipinfo', 'amazonaws', 'icanhazip', 'ipify'];
    for (const fallbackChoice of fallbacks) {
      if (fallbackChoice === apiChoice) continue;
      try {
        const fallbackApi = apis[fallbackChoice];
        const response = await fetch(fallbackApi.url);
        if (response.ok) {
          const data = await response.text();
          return fallbackApi.parse(data);
        }
      } catch (e2) {
        continue;
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

// Convert IPv4 to 32-bit integer
function ipv4ToInt(ip) {
  const parts = ip.split('.').map(p => parseInt(p, 10));
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

// Convert integer back to IPv4
function intToIpv4(int) {
  return [
    (int >>> 24) & 0xFF,
    (int >>> 16) & 0xFF,
    (int >>> 8) & 0xFF,
    int & 0xFF
  ].join('.');
}

// Check if IP is in CIDR range
function isIpv4InCIDR(ip, cidr) {
  const [network, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  if (!isValidIPv4(network) || prefix < 0 || prefix > 32) {
    return false;
  }
  
  const ipInt = ipv4ToInt(ip);
  const networkInt = ipv4ToInt(network);
  const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
  
  return (ipInt & mask) === (networkInt & mask);
}

// Parse IPv4 range like "70.47.26.183-185" or "70.47.26.183-70.47.26.185"
function parseIpv4Range(range) {
  const parts = range.split('-').map(p => p.trim());
  
  if (parts.length !== 2) return null;
  
  let startIp, endIp;
  
  // Check if it's short form like "70.47.26.183-185"
  if (!parts[1].includes('.')) {
    const baseIp = parts[0].split('.');
    if (baseIp.length !== 4) return null;
    startIp = parts[0];
    endIp = `${baseIp[0]}.${baseIp[1]}.${baseIp[2]}.${parts[1]}`;
  } else {
    startIp = parts[0];
    endIp = parts[1];
  }
  
  if (!isValidIPv4(startIp) || !isValidIPv4(endIp)) {
    return null;
  }
  
  return { start: ipv4ToInt(startIp), end: ipv4ToInt(endIp) };
}

// Check if IP is in range
function isIpv4InRange(ip, range) {
  const ipInt = ipv4ToInt(ip);
  const parsed = parseIpv4Range(range);
  
  if (!parsed) return false;
  
  return ipInt >= parsed.start && ipInt <= parsed.end;
}

// Check IPv6 in CIDR (simplified - only supports standard notation)
function isIpv6InCIDR(ip, cidr) {
  const [network, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  if (!isValidIPv6(network) || prefix < 0 || prefix > 128) {
    return false;
  }
  
  // Normalize both IPs
  const normalizedIp = normalizeIPv6(ip);
  const normalizedNetwork = normalizeIPv6(network);
  
  // Simple comparison for common prefixes
  // This is a simplified version - full IPv6 CIDR would need hex conversion
  const ipParts = normalizedIp.split(':');
  const netParts = normalizedNetwork.split(':');
  const bitsToCheck = prefix;
  
  // Check full groups
  const fullGroups = Math.floor(bitsToCheck / 16);
  for (let i = 0; i < fullGroups; i++) {
    if (ipParts[i] !== netParts[i]) return false;
  }
  
  // Check partial group if needed
  if (bitsToCheck % 16 !== 0) {
    const partialBits = bitsToCheck % 16;
    const ipHex = parseInt(ipParts[fullGroups] || '0', 16);
    const netHex = parseInt(netParts[fullGroups] || '0', 16);
    const mask = (0xFFFF << (16 - partialBits)) & 0xFFFF;
    
    if ((ipHex & mask) !== (netHex & mask)) return false;
  }
  
  return true;
}

// Parse target input (supports CIDR, ranges, and lists)
function parseTargetIps(input, isIPv6 = false) {
  if (!input || !input.trim()) {
    return { type: 'none', value: null };
  }
  
  const trimmed = input.trim();
  
  // Check for CIDR notation
  if (trimmed.includes('/')) {
    return { type: 'cidr', value: trimmed };
  }
  
  // Check for range (IPv4 only)
  if (!isIPv6 && trimmed.includes('-') && !trimmed.includes(',')) {
    return { type: 'range', value: trimmed };
  }
  
  // Check for comma-separated list
  if (trimmed.includes(',')) {
    const ips = trimmed.split(',').map(ip => ip.trim()).filter(ip => ip);
    return { type: 'list', value: ips };
  }
  
  // Single IP
  return { type: 'list', value: [trimmed] };
}

// Check if current IP matches target specification
function isIpMatch(currentIp, targetSpec, isIPv6 = false) {
  if (!currentIp || !targetSpec) return false;
  
  switch (targetSpec.type) {
    case 'none':
      return false;
      
    case 'cidr':
      if (isIPv6) {
        return isIpv6InCIDR(currentIp, targetSpec.value);
      } else {
        return isIpv4InCIDR(currentIp, targetSpec.value);
      }
      
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

function updateStatus(status, ip, message) {
  statusIndicator.className = 'status-indicator ' + status;
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    checking: ''
  };
  
  statusText.textContent = {
    success: 'IP Address Match',
    error: 'IP Mismatch',
    warning: 'Warning',
    checking: 'Checking...'
  }[status] || 'Unknown';
  
  if (status !== 'checking') {
    statusText.textContent = icons[status] + ' ' + statusText.textContent;
  }
  
  currentIpElement.textContent = ip ? `Current IP: ${ip}` : '';
  statusMessage.textContent = message || '';
}

async function checkIPAddress() {
  updateStatus('checking', '', 'Fetching current IP addresses...');

  try {
    // Trigger IP check in background script (centralized logic)
    const response = await chrome.runtime.sendMessage({ action: 'checkIP' });

    if (!response || !response.success) {
      throw new Error('IP check failed');
    }

    // Read updated data from storage
    const { lastCheck, lastStatus, lastIpv4, lastIpv6, targetIpv4, targetIpv6, lastIpv4Isp, lastIpv4Country, lastIpv4City } =
      await chrome.storage.local.get(['lastCheck', 'lastStatus', 'lastIpv4', 'lastIpv6', 'targetIpv4', 'targetIpv6', 'lastIpv4Isp', 'lastIpv4Country', 'lastIpv4City']);

    // Build display message
    const ipDisplay = [];
    if (lastIpv4) ipDisplay.push(`IPv4: ${lastIpv4}`);
    if (lastIpv6) ipDisplay.push(`IPv6: ${lastIpv6}`);
    const displayText = ipDisplay.length > 0 ? ipDisplay.join(' | ') : 'No IP detected';

    // Update enhanced info display (ISP and location)
    const enhancedInfoElement = document.getElementById('enhancedInfo');
    if (enhancedInfoElement) {
      const parts = [];
      if (lastIpv4Isp) parts.push(`🏢 ${lastIpv4Isp}`);
      if (lastIpv4Country && lastIpv4City) {
        parts.push(`📍 ${lastIpv4City}, ${lastIpv4Country}`);
      } else if (lastIpv4Country) {
        parts.push(`📍 ${lastIpv4Country}`);
      } else if (lastIpv4City) {
        parts.push(`📍 ${lastIpv4City}`);
      }
      enhancedInfoElement.textContent = parts.length > 0 ? parts.join(' • ') : '';
    }

    // Determine message based on status
    let message = '';
    if (lastStatus === 'success') {
      message = 'IP address matches target configuration';
    } else if (lastStatus === 'warning') {
      message = 'IP leak detected - unwanted IP address present';
    } else if (lastStatus === 'error') {
      message = 'IP address does not match target';
    }

    // Update UI display
    updateStatus(lastStatus, displayText, message);

    // Update last check time
    if (lastCheck) {
      lastCheckElement.textContent = lastCheck;
    }

    // Refresh history display
    await loadAndDisplayHistory();

  } catch (error) {
    updateStatus('error', '', `Network error: Unable to fetch IP addresses. Check your internet connection.`);
  }
}

saveButton.addEventListener('click', async () => {
  const ipv4InputValue = targetIpv4Input.value.trim();
  const ipv6InputValue = targetIpv6Input.value.trim();
  const apiChoice = apiSelect.value;
  const intervalMinutes = parseInt(checkInterval.value, 10);
  
  // Parse inputs (supports CIDR, ranges, lists)
  // IMPORTANT: Allow empty to clear configuration
  const ipv4Spec = ipv4InputValue ? parseTargetIps(ipv4InputValue, false) : { type: 'none', value: null };
  const ipv6Spec = ipv6InputValue ? parseTargetIps(ipv6InputValue, true) : { type: 'none', value: null };
  
  // Validate based on type (skip if empty/none)
  if (ipv4Spec.type === 'list' && ipv4Spec.value) {
    for (const ip of ipv4Spec.value) {
      if (!isValidIPv4(ip)) {
        showNotification(`Invalid IPv4 address: ${ip}`, 'error');
        return;
      }
    }
  } else if (ipv4Spec.type === 'cidr' && ipv4Spec.value) {
    const [network] = ipv4Spec.value.split('/');
    if (!isValidIPv4(network)) {
      showNotification(`Invalid IPv4 CIDR: ${ipv4Spec.value}`, 'error');
      return;
    }
  } else if (ipv4Spec.type === 'range' && ipv4Spec.value) {
    const parsed = parseIpv4Range(ipv4Spec.value);
    if (!parsed) {
      showNotification(`Invalid IPv4 range: ${ipv4Spec.value}`, 'error');
      return;
    }
  }
  
  if (ipv6Spec.type === 'list' && ipv6Spec.value) {
    for (const ip of ipv6Spec.value) {
      if (!isValidIPv6(ip)) {
        showNotification(`Invalid IPv6 address: ${ip}`, 'error');
        return;
      }
    }
  } else if (ipv6Spec.type === 'cidr' && ipv6Spec.value) {
    const [network] = ipv6Spec.value.split('/');
    if (!isValidIPv6(network)) {
      showNotification(`Invalid IPv6 CIDR: ${ipv6Spec.value}`, 'error');
      return;
    }
  }
  
  // Save configuration
  await chrome.storage.local.set({
    targetIpv4: ipv4Spec,
    targetIpv6: ipv6Spec,
    apiChoice: apiChoice,
    checkInterval: intervalMinutes,
    notificationsEnabled: notificationsToggle.checked
  });
  
  // Update alarm with new interval
  await chrome.runtime.sendMessage({ 
    action: 'updateInterval', 
    interval: intervalMinutes 
  });
  
  const configured = [];
  if (ipv4Spec.type !== 'none') {
    const typeLabel = { cidr: 'CIDR', range: 'Range', list: 'List' }[ipv4Spec.type] || 'IP';
    configured.push(`IPv4 ${typeLabel}`);
  }
  if (ipv6Spec.type !== 'none') {
    const typeLabel = { cidr: 'CIDR', list: 'List' }[ipv6Spec.type] || 'IP';
    configured.push(`IPv6 ${typeLabel}`);
  }
  
  const mode = [];
  if (ipv4Spec.type === 'none') mode.push('Verify NO IPv4');
  if (ipv6Spec.type === 'none') mode.push('Verify NO IPv6');
  
  let message = '✓ Saved';
  if (configured.length > 0) {
    message += ': ' + configured.join(', ');
  }
  if (mode.length > 0) {
    message += ' | ' + mode.join(', ');
  }
  message += ` | Check every ${intervalMinutes}min`;
  
  showNotification(message, 'success');
  checkIPAddress();
});

async function loadAndDisplayHistory() {
  const { ipCheckHistory } = await chrome.storage.local.get(['ipCheckHistory']);
  const history = ipCheckHistory || [];

  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-history">No history yet. IP checks will appear here.</div>';
    return;
  }

  historyList.innerHTML = history.map(entry => {
    const statusClass = entry.status;
    const statusText = entry.status.charAt(0).toUpperCase() + entry.status.slice(1);
    const ipDisplay = entry.ipv4 !== 'N/A' ? entry.ipv4 : (entry.ipv6 !== 'N/A' ? entry.ipv6 : 'N/A');

    // Determine change reason display
    let changeDisplay;
    if (entry.changeReason === 'both') {
      changeDisplay = 'Status + IP';
    } else if (entry.changeReason === 'status') {
      changeDisplay = 'Status';
    } else if (entry.changeReason === 'ip') {
      changeDisplay = 'IP';
    } else {
      changeDisplay = 'Initial';
    }

    return `
      <div class="history-entry ${statusClass}">
        <div class="entry-col">${entry.displayTime}</div>
        <div class="entry-col"><span class="entry-status ${statusClass}">${statusText}</span></div>
        <div class="entry-col entry-ip">${ipDisplay}</div>
        <div class="entry-col change-reason">${changeDisplay}</div>
      </div>
    `;
  }).join('');
}

async function exportHistoryToCsv() {
  const { ipCheckHistory } = await chrome.storage.local.get(['ipCheckHistory']);
  const history = ipCheckHistory || [];

  if (history.length === 0) {
    showNotification('No history to export', 'error');
    return;
  }

  // CSV header
  let csv = 'Timestamp,Status,IPv4,IPv6,Changed\n';

  // CSV rows
  history.forEach(entry => {
    const timestamp = new Date(entry.timestamp).toLocaleString();
    let changedText;
    if (entry.changeReason === 'both') {
      changedText = 'Status + IP';
    } else if (entry.changeReason === 'status') {
      changedText = 'Status';
    } else if (entry.changeReason === 'ip') {
      changedText = 'IP';
    } else {
      changedText = 'Initial';
    }
    csv += `"${timestamp}","${entry.status}","${entry.ipv4}","${entry.ipv6}","${changedText}"\n`;
  });

  // Download file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ip-guard-history-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showNotification('History exported successfully!', 'success');
}

let clearHistoryConfirm = false;
let clearHistoryTimeout = null;

async function clearHistory() {
  if (!clearHistoryConfirm) {
    // First click: show confirmation state
    clearHistoryConfirm = true;
    clearHistoryButton.textContent = 'Click again to confirm';
    clearHistoryButton.classList.add('btn-confirm');

    // Reset after 3 seconds if no second click
    clearHistoryTimeout = setTimeout(() => {
      clearHistoryConfirm = false;
      clearHistoryButton.textContent = 'Clear History';
      clearHistoryButton.classList.remove('btn-confirm');
    }, 3000);

    return;
  }

  // Second click: actually clear
  clearTimeout(clearHistoryTimeout);
  clearHistoryConfirm = false;
  clearHistoryButton.textContent = 'Clear History';
  clearHistoryButton.classList.remove('btn-confirm');

  await chrome.storage.local.set({ ipCheckHistory: [] });
  await loadAndDisplayHistory();
  showNotification('History cleared', 'success');
}

checkButton.addEventListener('click', () => {
  checkIPAddress();
});

exportCsvButton.addEventListener('click', exportHistoryToCsv);
clearHistoryButton.addEventListener('click', clearHistory);

// Auto-save advanced settings
apiSelect.addEventListener('change', async () => {
  const apiChoice = apiSelect.value;
  await chrome.storage.local.set({ apiChoice: apiChoice });
  showNotification('API updated. Checking IP now...', 'success');
  await checkIPAddress();
});

checkInterval.addEventListener('change', async () => {
  const intervalMinutes = parseInt(checkInterval.value, 10);
  await chrome.storage.local.set({ checkInterval: intervalMinutes });
  await chrome.runtime.sendMessage({
    action: 'updateInterval',
    interval: intervalMinutes
  });
  autoCheckIntervalElement.textContent = `Every ${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''}`;
  showNotification(`Auto-check interval updated to ${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''}`, 'success');
});

notificationsToggle.addEventListener('change', async () => {
  const enabled = notificationsToggle.checked;
  await chrome.storage.local.set({ notificationsEnabled: enabled });
  showNotification(`Notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
});

(async function init() {
  const { targetIpv4, targetIpv6, apiChoice, checkInterval, lastCheck, notificationsEnabled } = await chrome.storage.local.get([
    'targetIpv4', 'targetIpv6', 'apiChoice', 'checkInterval', 'lastCheck', 'notificationsEnabled'
  ]);
  
  // Handle spec format
  if (targetIpv4 && targetIpv4.type && targetIpv4.type !== 'none') {
    if (targetIpv4.type === 'list') {
      targetIpv4Input.value = targetIpv4.value.join(', ');
    } else {
      targetIpv4Input.value = targetIpv4.value;
    }
  } else if (targetIpv4 && Array.isArray(targetIpv4)) {
    // Legacy: array format
    targetIpv4Input.value = targetIpv4.join(', ');
  }
  // else: leave empty (allows clearing)
  
  if (targetIpv6 && targetIpv6.type && targetIpv6.type !== 'none') {
    if (targetIpv6.type === 'list') {
      targetIpv6Input.value = targetIpv6.value.join(', ');
    } else {
      targetIpv6Input.value = targetIpv6.value;
    }
  } else if (targetIpv6 && Array.isArray(targetIpv6)) {
    // Legacy: array format
    targetIpv6Input.value = targetIpv6.join(', ');
  }
  // else: leave empty (allows clearing)
  
  if (apiChoice) {
    apiSelect.value = apiChoice;
  }
  
  if (checkInterval) {
    checkInterval.value = checkInterval.toString();
  }

  if (notificationsEnabled !== undefined) {
    notificationsToggle.checked = notificationsEnabled;
  } else {
    notificationsToggle.checked = true; // Default: enabled
  }

  checkIPAddress();

  // Load and display history
  await loadAndDisplayHistory();

  if (lastCheck) {
    lastCheckElement.textContent = lastCheck;
  }
  
  // Update auto-check display
  const intervalMinutes = checkInterval || 2;
  document.getElementById('autoCheckInterval').textContent = `Every ${intervalMinutes} minute${intervalMinutes !== 1 ? 's' : ''}`;
})();
