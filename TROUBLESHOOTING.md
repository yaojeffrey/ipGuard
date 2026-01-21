# 🔍 IP Detection Troubleshooting Guide

## Issue: Extension Shows Different IP Than Expected

### Why This Happens

Different IP detection services can report different IP addresses for several reasons:

#### 1. **IPv4 vs IPv6 Confusion**
- Some sites prefer IPv6 over IPv4 (or vice versa)
- **Example**: 
  - whatismyipaddress.com shows: `70.47.26.183` (IPv4)
  - Extension shows: `70.47.26.184` (IPv4)
  - These might both be valid IPs from your ISP's pool

#### 2. **ISP IP Rotation/Pool**
- Some ISPs assign multiple IPs from a pool
- Your connection might use different IPs for different routes
- Load balancers can cause this

#### 3. **VPN Split Tunneling**
- Some VPNs route certain traffic differently
- Browser extensions might be routed differently than web traffic

#### 4. **Timing Differences**
- Your IP might have changed between checks
- Dynamic IPs can change frequently

#### 5. **Proxy or Network Routing**
- Network routing can affect which IP is visible
- Some networks have multiple exit points

---

## 🛠️ Solutions

### Solution 1: Use the Debug Tool

1. **Open** `debug-ip-detection.html` in your browser
2. **Wait** for all 6 APIs to complete testing
3. **Compare** results with whatismyipaddress.com
4. **Identify** which API matches your expected IP

**Example Output:**
```
ipify.org (JSON):     70.47.26.184
icanhazip.com:        70.47.26.183
api.my-ip.io:         70.47.26.183
whatismyipaddress:    70.47.26.183
```

→ In this case, use **icanhazip** or **api.my-ip.io** in the extension

---

### Solution 2: Change Detection API in Extension

1. **Open** IP Guard extension popup
2. **Click** "Advanced Settings" (expand dropdown)
3. **Select** alternative API from dropdown:
   - ipify.org (Default)
   - icanhazip.com (Alternative)
   - api.my-ip.io (Alternative)
4. **Click** "Save Target IPs"
5. **Verify** new IP matches expected

---

### Solution 3: Use Your VPN Provider's IP

**Best Practice**: Use the IP that your VPN provider says you have.

**How to find it:**
1. Check your VPN app's connection info
2. Look for "Connected IP" or "Exit IP"
3. Use that IP in IP Guard

**Why**: This is the most reliable source because it's what your VPN actually assigns you.

---

## 🎯 Which IP Should I Trust?

### Priority Order:

1. **Your VPN Provider's Dashboard** ⭐ (Most Reliable)
   - Log into your VPN account
   - Check "current connection" or "my IP"

2. **Multiple IP Detection Services Agreeing** ⭐
   - If 3+ services show the same IP, trust that one

3. **Your Network Administrator** (for corporate networks)
   - They can tell you your exit IP

4. **Single IP Detection Service** ⚠️
   - Less reliable due to routing differences

---

## 🧪 Testing Steps

### Complete Verification Process:

```
Step 1: Run Debug Tool
├─ Open: debug-ip-detection.html
├─ Record all IPs shown
└─ Note which services agree

Step 2: Check VPN Provider
├─ Log into VPN app/dashboard
├─ Find "Current IP" or "Connection Info"
└─ Record the IP shown

Step 3: Check Multiple Sites
├─ whatismyipaddress.com
├─ ipinfo.io
├─ iplocation.net
└─ Record each IP

Step 4: Compare Results
├─ Look for most common IP
├─ Prioritize VPN provider's IP
└─ Choose that as your target IP

Step 5: Configure Extension
├─ Enter the verified IP
├─ Choose matching API (if needed)
└─ Test monitoring
```

---

## 📊 Example Scenarios

### Scenario A: ISP IP Pool (Both IPs Valid)

**Situation:**
```
Extension shows:  70.47.26.184
Website shows:    70.47.26.183
VPN shows:        70.47.26.184
```

**Analysis**: Your ISP uses a pool of IPs. Both are yours.

**Solution**: Use `70.47.26.184` (what VPN shows) as target.

---

### Scenario B: IPv4 vs IPv6 Mix-up

**Situation:**
```
Extension shows:  2001:db8::100 (IPv6)
Website shows:    70.47.26.183 (IPv4)
```

**Analysis**: Sites are showing different protocol versions.

**Solution**: 
- Configure BOTH in IP Guard
- IPv4: `70.47.26.183`
- IPv6: `2001:db8::100`

---

### Scenario C: VPN Leak Detected

**Situation:**
```
Extension shows:  98.142.15.22 (Your real IP)
VPN shows:        203.0.113.45 (VPN IP)
```

**Analysis**: VPN is NOT working! You're exposed!

**Solution**: 
1. Reconnect VPN
2. Set target to `203.0.113.45`
3. Verify green ✓ status

---

## 🔧 Advanced Diagnostics

### Check Both IPv4 and IPv6

Run these commands in your terminal:

**Windows PowerShell:**
```powershell
# Check IPv4
(Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content

# Check IPv6
(Invoke-WebRequest -Uri "https://api64.ipify.org" -UseBasicParsing).Content
```

**Linux/Mac Terminal:**
```bash
# Check IPv4
curl -4 https://api.ipify.org

# Check IPv6
curl -6 https://api64.ipify.org
```

---

## 🎓 Understanding IP Differences

### When 1 IP Off (e.g., .183 vs .184)

**Common with:**
- Load-balanced connections
- Multiple NAT gateways
- ISP IP pools
- Some VPN configurations

**Not a problem if:**
- Both IPs belong to same ISP/VPN provider
- Your VPN confirms one of them
- Connection is stable

**Problem if:**
- IPs belong to different countries
- One is your real ISP, other is VPN
- Indicates partial VPN failure

---

## ⚡ Quick Fix Checklist

- [ ] Run debug-ip-detection.html
- [ ] Check VPN app for current IP
- [ ] Visit 2-3 IP checking websites
- [ ] Identify most common IP reported
- [ ] Configure that IP in IP Guard
- [ ] If still wrong, change API in Advanced Settings
- [ ] Verify green ✓ status
- [ ] Document which IP/API works for future

---

## 🆘 Still Having Issues?

### If extension NEVER matches:

1. **Verify VPN is actually connected**
   - Check VPN app status
   - Try browsing - does your location change?

2. **Check for DNS leaks**
   - Visit dnsleaktest.com
   - Ensure no DNS leaks detected

3. **Disable other extensions temporarily**
   - Other extensions might affect routing
   - Test with only IP Guard enabled

4. **Try different API**
   - Use Advanced Settings
   - Test each API option

5. **Check firewall/antivirus**
   - Some security software blocks IP APIs
   - Temporarily disable to test

---

## 💡 Pro Tips

✅ **Use VPN provider's IP as source of truth**

✅ **Configure both IPv4 AND IPv6 if available**

✅ **Run debug tool weekly to verify stability**

✅ **Save screenshot of VPN's IP display**

✅ **Document which API works best for you**

❌ **Don't assume website IPs are always correct**

❌ **Don't ignore partial matches (orange ⚠)**

❌ **Don't trust only one IP checking service**

---

## 📞 Getting Help

If IP discrepancy persists:

1. **Run debug tool** → Screenshot results
2. **Check VPN provider** → Screenshot their IP display
3. **Test with all 3 APIs** → Document results
4. **Check if both IPs in same network range**
5. **Contact VPN provider** if suspected VPN issue

---

**Remember**: The goal is to monitor that you're using your VPN/network's expected IP, not to verify what random websites say your IP is. Always trust your VPN provider's IP display first!
