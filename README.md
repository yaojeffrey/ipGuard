# 🛡️ IP Guard - Chrome/Edge Extension

A browser extension that monitors and verifies your public IP addresses (both IPv4 and IPv6) match your configured target IPs, with DNS leak detection.

## Features

- ✅ **Dual IP Monitoring**: Monitors both IPv4 and IPv6 simultaneously
- 🔍 **DNS Leak Detection**: Warns if only one IP matches (potential leak)
- ⏰ **Real-time Monitoring**: Automatically checks every 2 minutes
- 🌐 **IPv4 & IPv6 Support**: Configure one or both IP types
- 🎨 **Visual Indicators**: 
  - ✓ Green checkmark when all configured IPs match
  - ⚠ Orange warning for partial matches (DNS leak detected)
  - ✗ Red X when IPs don't match
  - ! Gray exclamation for network issues
- 🔔 **Badge Notifications**: Extension icon shows status at a glance
- 🚀 **Manual Check**: Click "Check Now" button for instant verification
- 📊 **Detailed Status**: Shows current IPv4/IPv6, last check time, and helpful messages

## Installation

### Option 1: From Microsoft Edge Add-ons Store (Recommended)

🚀 **Coming soon!** Currently under review by Microsoft.

Once approved, you can install with one click from:
- **Edge Store**: Search for "IP Guard" at https://microsoftedge.microsoft.com/addons/

### Option 2: Install from Source (For Developers/Testers)

1. **Download**: 
   - Go to https://github.com/yaojeffrey/ipGuard
   - Click green "Code" button → "Download ZIP"
   - Extract to a folder

2. **Load in Browser**:
   - **Edge**: Go to `edge://extensions/`, enable "Developer mode" (bottom-left), click "Load unpacked"
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode" (top-right), click "Load unpacked"
   - Select the extracted folder

3. **Done**: Extension icon appears in toolbar

⚠️ **Note**: Manual installation requires Developer mode and won't auto-update. See [INSTALL_FROM_SOURCE.md](INSTALL_FROM_SOURCE.md) for details.

## Usage

1. **Configure Target IPs**:
   - Click the IP Guard extension icon
   - Enter your target IPv4 address (optional)
   - Enter your target IPv6 address (optional)
   - At least one IP must be configured
   - Click "Save Target IPs"

2. **Monitor Status**:
   - Extension automatically checks every 2 minutes
   - Badge on icon shows current status:
     - ✓ = All configured IPs match perfectly
     - ⚠ = Partial match (DNS LEAK WARNING)
     - ✗ = IP mismatch
     - ! = Network error
   - Click icon to see detailed information

3. **Manual Check**:
   - Click "Check Now" button for immediate verification

## Status Meanings

| Badge | Status | Description |
|-------|--------|-------------|
| ✓ (Green) | Perfect Match | All configured IPs match targets |
| ⚠ (Orange) | Partial Match | **DNS LEAK WARNING** - Only some IPs match |
| ✗ (Red) | Mismatch | None of your IPs match targets |
| ! (Gray) | Network Error | Cannot detect IP or no network |

## DNS Leak Detection

The extension warns you if:
- You configured both IPv4 and IPv6, but only one matches
- You configured one IP type, but the other is also active and doesn't match
- This indicates potential DNS leaks or VPN configuration issues

## Example Configurations

**Scenario 1: VPN with both IPv4 and IPv6**
- Target IPv4: `203.0.113.45`
- Target IPv6: `2001:db8::1`
- Result: Both must match for ✓ status

**Scenario 2: IPv4-only VPN**
- Target IPv4: `203.0.113.45`
- Target IPv6: Leave empty
- Result: Only IPv4 is checked

**Scenario 3: IPv6-only network**
- Target IPv4: Leave empty
- Target IPv6: `2001:db8::1`
- Result: Only IPv6 is checked

## Privacy

- This extension only checks your public IP addresses using ipify.org API
- No data is collected or transmitted except for the IP checks
- Target IPs are stored locally in your browser
- Checks both IPv4 and IPv6 for comprehensive monitoring

## Technical Details

- Uses ipify.org API for IPv4 detection
- Uses api64.ipify.org for IPv6 detection
- Both APIs are queried simultaneously
- Manifest V3 compatible
- Auto-check interval: 2 minutes
- Detects DNS leaks when only partial IP matches occur

## Troubleshooting

**"Network error" message**: Check your internet connection

**IP not updating**: Click "Check Now" to force an immediate check

**Badge not showing**: Ensure you've saved a target IP address

## Files Structure

```
ip-guard-extension/
├── manifest.json       # Extension configuration
├── popup.html          # Extension popup UI
├── popup.css          # Popup styling
├── popup.js           # Popup logic
├── background.js      # Background service worker
├── icons/             # Extension icons
│   └── icon.svg       # Base SVG icon
└── README.md          # This file
```

## License

Free to use and modify as needed.

## Notes

- For production use, replace placeholder icons with proper PNG files (16x16, 48x48, 128x128)
- The extension requests minimal permissions (storage and alarms only)
- Network requests are limited to ipify.org domains
