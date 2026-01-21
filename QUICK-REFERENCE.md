# 🛡️ IP Guard - Quick Reference Card

## 📝 Configuration

```
┌─────────────────────────────────────┐
│  Target IPv4: [203.0.113.45     ]  │  ← Your VPN's IPv4 (optional)
│  Target IPv6: [2001:db8::1      ]  │  ← Your VPN's IPv6 (optional)
│                                     │
│  [Save Target IPs]  [Check Now]    │
└─────────────────────────────────────┘
```

**Rules:**
- At least ONE IP required
- Leave empty to skip that IP type
- No spaces before/after IPs

---

## 🎯 Status Meanings

| Badge | Display | What It Means | What To Do |
|:-----:|---------|---------------|------------|
| **✓** | 🟢 Green | ✅ All IPs match perfectly | Nothing - you're secure! |
| **⚠** | 🟠 Orange | ⚠️ Partial match (DNS LEAK!) | Check VPN immediately! |
| **✗** | 🔴 Red | ❌ IPs don't match | Reconnect VPN |
| **!** | ⚪ Gray | ℹ️ Network error | Check internet |

---

## 🔍 DNS Leak Detection

### What triggers Orange ⚠ warning?

```
Configured:     IPv4 ✓  +  IPv6 ✓
Actual result:  IPv4 ✅  +  IPv6 ❌  → ⚠️ WARNING!
```

**Why this matters:**
- Your IPv6 traffic is NOT going through VPN
- DNS requests may leak your real location
- This defeats the purpose of a VPN

---

## 📋 Common Configurations

### Config 1: Maximum Security (Recommended)
```
Target IPv4: ✓ (your VPN's IPv4)
Target IPv6: ✓ (your VPN's IPv6)
Result: Both must match for green ✓
```

### Config 2: IPv4-Only VPN
```
Target IPv4: ✓ (your VPN's IPv4)
Target IPv6: ✗ (leave empty)
Result: Only IPv4 checked
```

### Config 3: IPv6-Only Network
```
Target IPv4: ✗ (leave empty)
Target IPv6: ✓ (your network's IPv6)
Result: Only IPv6 checked
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Badge shows nothing | Configure at least one target IP |
| Orange ⚠ warning | Reconnect VPN - one IP is leaking! |
| Red ✗ mismatch | VPN disconnected or wrong server |
| Gray ! error | Check internet connection |
| Wrong IP shown | Update target IPs in settings |

---

## ⚡ Quick Actions

### First Time Setup (1 minute)
1. Get your VPN's IPs (from VPN provider)
2. Click IP Guard icon
3. Enter IPv4 and/or IPv6
4. Click "Save Target IPs"
5. Verify green ✓ badge

### Daily Use
1. Check badge color: Green = Good
2. If Orange/Red: Click icon for details
3. Reconnect VPN if needed
4. Click "Check Now" to verify fix

### Changing VPN Servers
1. Connect to new VPN server
2. Get new server's IPs
3. Open IP Guard
4. Update target IPs
5. Click "Save Target IPs"

---

## 💡 Pro Tips

✅ **Enable auto-start**: Keep extension running for continuous monitoring

✅ **Pin to toolbar**: Keep IP Guard icon visible

✅ **Check after connecting**: Always verify green ✓ after connecting VPN

✅ **Don't ignore orange**: Partial matches are security risks!

✅ **Use both IP types**: Configure IPv4 AND IPv6 for complete protection

---

## 📊 Status Examples

### ✅ Perfect (Green)
```
Status: ✓ IP Address Match
IPv4: 203.0.113.45 | IPv6: 2001:db8::1
Perfect match! IPv4 ✓ & IPv6 ✓
```

### ⚠️ DNS Leak (Orange)
```
Status: ⚠ PARTIAL MATCH - Possible DNS Leak!
IPv4: 203.0.113.45 | IPv6: 2001:db8:bad::99
IPv6 mismatch (leak detected)
```

### ❌ Disconnected (Red)
```
Status: ✗ IP Mismatch
IPv4: 198.51.100.25 | IPv6: 2001:db8:bad::99
IP mismatch detected
```

---

## 🔄 Auto-Check Schedule

```
Every 2 minutes:
  ├─ Fetch IPv4 from api.ipify.org
  ├─ Fetch IPv6 from api64.ipify.org
  ├─ Compare to your targets
  └─ Update badge color
```

**Manual check**: Click "Check Now" anytime

---

## 🎓 Understanding Results

### Both IPs Configured

| IPv4 | IPv6 | Result |
|------|------|--------|
| ✅ Match | ✅ Match | 🟢 Green ✓ |
| ✅ Match | ❌ Mismatch | 🟠 Orange ⚠ |
| ❌ Mismatch | ✅ Match | 🟠 Orange ⚠ |
| ❌ Mismatch | ❌ Mismatch | 🔴 Red ✗ |

### Only IPv4 Configured

| IPv4 | Result |
|------|--------|
| ✅ Match | 🟢 Green ✓ |
| ❌ Mismatch | 🔴 Red ✗ |

### Only IPv6 Configured

| IPv6 | Result |
|------|--------|
| ✅ Match | 🟢 Green ✓ |
| ❌ Mismatch | 🔴 Red ✗ |

---

## 🎯 Goal

**Keep the badge GREEN ✓ at all times!**

Green = Secure ✅  
Orange = Leak ⚠️  
Red = Exposed ❌  

---

## 📞 Need Help?

See full documentation:
- **README.md** - Technical details
- **INSTALLATION.md** - Setup guide
- **EXAMPLES.md** - Detailed scenarios

---

**Version**: 1.0.0  
**Check Frequency**: Every 2 minutes  
**APIs Used**: ipify.org (IPv4), api64.ipify.org (IPv6)
