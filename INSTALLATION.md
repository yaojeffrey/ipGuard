# IP Guard Extension - Installation & Usage Guide

## 🚀 Quick Start

### Step 1: Install the Extension

#### For Chrome:
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Toggle **"Developer mode"** ON (top right corner)
4. Click **"Load unpacked"**
5. Browse to and select the `ip-guard-extension` folder
6. The IP Guard icon should appear in your toolbar

#### For Microsoft Edge:
1. Open Edge browser
2. Navigate to `edge://extensions/`
3. Toggle **"Developer mode"** ON (bottom left)
4. Click **"Load unpacked"**
5. Browse to and select the `ip-guard-extension` folder
6. The IP Guard icon should appear in your toolbar

### Step 2: Configure Your Target IPs

1. Click the **IP Guard** icon in your browser toolbar
2. Enter your target IP addresses:
   - **IPv4 field**: Enter your target IPv4 (e.g., `203.0.113.45`)
   - **IPv6 field**: Enter your target IPv6 (e.g., `2001:db8::1`)
   - You can configure both, or just one (leave the other empty)
   - At least one IP address is required
3. Click **"Save Target IPs"**
4. The extension will immediately check your current IPs

**Configuration Examples:**
- **Both IPs**: For dual-stack VPN verification
- **IPv4 only**: For IPv4-only VPN or network
- **IPv6 only**: For IPv6-only network verification

### Step 3: Monitor Your IPs

The extension automatically monitors your IPs every 2 minutes. You can also:
- Click **"Check Now"** for an instant check
- Look at the badge on the extension icon:
  - **✓** = All configured IPs match perfectly ✅
  - **⚠** = Partial match - DNS LEAK WARNING ⚠️
  - **✗** = IPs don't match ❌
  - **!** = Network error or no internet ⚠️

---

## 📖 Detailed Features

### Visual Status Indicators

| Status | Icon | Badge | Meaning |
|--------|------|-------|---------|
| Perfect Match | ✓ Green | ✓ | All configured IPs match targets |
| Partial Match | ⚠ Orange | ⚠ | **DNS LEAK** - Only some IPs match |
| Mismatch | ✗ Red | ✗ | None of your IPs match targets |
| Warning | ⚠ Orange | ! | Network issue or no target set |
| Checking | Spinner | - | Currently fetching IP addresses |

### Information Displayed

- **Current IPv4 Address**: Your actual public IPv4 (if available)
- **Current IPv6 Address**: Your actual public IPv6 (if available)
- **Target IPs**: The IPs you configured (shown on mismatch)
- **Last Check Time**: When the last verification occurred
- **Status Message**: Detailed context about your connection

### DNS Leak Detection

The extension automatically detects potential DNS leaks by checking:
- If you configured both IPv4 and IPv6, but only one matches
- If one IP type is detected but doesn't match your configuration
- **Orange ⚠ badge** indicates a partial match (potential DNS leak)

### Auto-Monitoring

- Checks every **2 minutes** automatically
- Runs in the background
- Updates badge icon immediately
- Low resource usage

---

## 🎯 Use Cases

### VPN Verification (Dual Stack)
Monitor both IPv4 and IPv6 through your VPN:
1. Find your VPN server's IPv4 and IPv6 addresses
2. Set both as targets in IP Guard
3. Get alerted if either IP leaks outside the VPN

### IPv4-only VPN
Ensure only IPv4 traffic routes through VPN:
1. Configure only the target IPv4 address
2. Leave IPv6 field empty
3. Monitor to ensure no IPv6 leaks

### Network Security
Verify you're on a specific network:
1. Get your office/home network's public IPv4 and/or IPv6
2. Set as targets
3. Get alerted if you're on a different network

### DNS Leak Detection
Ensure all traffic routes through expected IPs:
1. Configure expected exit IPs (both IPv4 and IPv6)
2. Monitor for unexpected changes
3. Get instant alerts on partial matches (DNS leaks)

---

## 🔧 Troubleshooting

### "Please set at least one target IP address"
- You haven't configured any target IPs yet
- Click the extension and enter at least one IP (IPv4 or IPv6)

### "Network error: Unable to fetch IP addresses"
- Check your internet connection
- Firewall might be blocking ipify.org
- Try disabling ad-blockers temporarily

### Orange ⚠ "Partial Match" warning
- **This indicates a potential DNS leak!**
- Only some of your configured IPs match
- Example: IPv4 matches but IPv6 doesn't (or vice versa)
- Check your VPN/network configuration

### Badge not showing status
- Ensure you've saved at least one target IP
- Click "Check Now" to force an update
- Restart the browser if needed

### IP showing but status wrong
- Verify you entered the correct target IPs
- Check for extra spaces in the IP fields
- IPv6 addresses are normalized (lowercase, compressed)
- Both IPv4 and IPv6 must match if both are configured

### Extension not loading
- Ensure Developer Mode is enabled
- Check that all files are present in the folder
- Look at `chrome://extensions/` errors section

---

## 🔒 Privacy & Security

- **No data collection**: Nothing is sent to external servers except IP check
- **Local storage only**: Target IP stored in browser's local storage
- **Open source**: All code is visible and auditable
- **Minimal permissions**: Only needs storage and alarms
- **Trusted API**: Uses ipify.org (popular, reliable IP detection service)

---

## 📁 File Structure

```
ip-guard-extension/
├── manifest.json          # Extension configuration
├── popup.html            # User interface
├── popup.css             # Styling
├── popup.js              # UI logic and IP checking
├── background.js         # Background monitoring service
├── icons/
│   ├── icon16.png       # Toolbar icon
│   ├── icon48.png       # Extension management icon
│   └── icon128.png      # Chrome Web Store icon
├── README.md            # Project documentation
├── INSTALLATION.md      # This file
├── create-icons.ps1     # Icon generation script
└── generate-icons.html  # Manual icon generator
```

---

## 🛠️ Advanced Configuration

### Change Check Interval

Edit `background.js`, line 2:
```javascript
chrome.alarms.create('checkIP', { periodInMinutes: 2 }); // Change 2 to desired minutes
```

### Use Different IP API

Edit `popup.js` and `background.js`, find:
```javascript
const apiUrl = isIPv6Target ? 'https://api64.ipify.org?format=json' : 'https://api.ipify.org?format=json';
```

Replace with your preferred API endpoint.

---

## 📝 Notes

- **First load**: Extension badge will be empty until you set a target IP
- **IPv6 detection**: Automatically uses IPv6 API if target is IPv6
- **Normalized comparison**: IPv6 addresses are normalized before comparison (e.g., `2001:db8::1` equals `2001:0db8:0000:0000:0000:0000:0000:0001`)
- **Persistent monitoring**: Continues checking even when popup is closed

---

## 🆘 Support

If you encounter issues:

1. **Check browser console**: Right-click extension → Inspect → Console tab
2. **Verify permissions**: Ensure storage and alarms permissions are granted
3. **Test API manually**: Visit https://api.ipify.org in your browser
4. **Reload extension**: Toggle it off/on in extensions page

---

## 🎨 Customization

### Change Colors

Edit `popup.css`:
- Success green: `#27ae60` (line 43)
- Error red: `#e74c3c` (line 47)
- Warning orange: `#f39c12` (line 51)
- Primary blue: `#3498db` (line 154)

### Change Extension Name

Edit `manifest.json`:
```json
"name": "Your Custom Name"
```

---

## ✅ Verification Checklist

After installation, verify:
- [ ] Extension icon appears in toolbar
- [ ] Clicking icon opens popup
- [ ] Can enter and save target IP
- [ ] "Check Now" button works
- [ ] Badge shows status after check
- [ ] Current IP displays correctly
- [ ] Status messages are helpful

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Compatibility**: Chrome 88+, Edge 88+
