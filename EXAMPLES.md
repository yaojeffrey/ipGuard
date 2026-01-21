# IP Guard - Example Scenarios & Status Messages

## Understanding Status Messages

### ✅ Perfect Match (Green ✓)
```
✓ IP Address Match
IPv4: 203.0.113.45 | IPv6: 2001:db8::1
Perfect match! IPv4 ✓ & IPv6 ✓
Last Check: 5:15:30 PM
```
**Meaning**: All configured IP addresses match perfectly. Your connection is secure.

---

### ⚠️ Partial Match - DNS LEAK WARNING (Orange ⚠)

#### Scenario 1: IPv4 matches, IPv6 doesn't
```
⚠ PARTIAL MATCH - Possible DNS Leak!
IPv4: 203.0.113.45 | IPv6: 2001:db8:bad::99
⚠ PARTIAL MATCH - Possible DNS Leak!
IPv6 mismatch (2001:db8:bad::99 ≠ 2001:db8::1)
```
**Meaning**: Your IPv4 is correct, but IPv6 is leaking outside the VPN!

#### Scenario 2: IPv6 matches, IPv4 doesn't
```
⚠ PARTIAL MATCH - Possible DNS Leak!
IPv4: 198.51.100.25 | IPv6: 2001:db8::1
⚠ PARTIAL MATCH - Possible DNS Leak!
IPv4 mismatch (198.51.100.25 ≠ 203.0.113.45)
```
**Meaning**: Your IPv6 is correct, but IPv4 is leaking outside the VPN!

#### Scenario 3: One IP not detected
```
⚠ PARTIAL MATCH - Possible DNS Leak!
IPv4: 203.0.113.45
⚠ PARTIAL MATCH - Possible DNS Leak!
IPv6 not detected
```
**Meaning**: IPv4 is fine, but IPv6 is not active (might be okay depending on setup).

---

### ❌ Complete Mismatch (Red ✗)

#### Scenario 1: Both IPs wrong
```
✗ IP Mismatch
IPv4: 198.51.100.25 | IPv6: 2001:db8:bad::99
IP mismatch detected:
IPv4: 198.51.100.25 ≠ 203.0.113.45
IPv6: 2001:db8:bad::99 ≠ 2001:db8::1
```
**Meaning**: Neither IP matches. VPN is not connected or routing to wrong location.

#### Scenario 2: No network connection
```
✗ IP Mismatch
No active network connection detected
```
**Meaning**: Cannot detect any IP addresses. Check your internet connection.

---

### ⚠️ Configuration Issues (Orange ⚠)

#### Scenario 1: No target IPs configured
```
⚠ Warning
Please configure your target IP addresses (IPv4 and/or IPv6)
```
**Meaning**: You need to set up target IPs first.

---

## Configuration Examples

### Example 1: Dual-Stack VPN (Most Secure)

**Your VPN provides:**
- IPv4: `203.0.113.45`
- IPv6: `2001:db8::1`

**Configuration:**
```
Target IPv4: 203.0.113.45
Target IPv6: 2001:db8::1
```

**What to expect:**
- ✅ Both IPs match → **Green ✓** (Perfect!)
- ⚠️ Only one matches → **Orange ⚠** (DNS LEAK!)
- ❌ Neither matches → **Red ✗** (VPN disconnected)

**Best for**: Maximum security, full leak detection

---

### Example 2: IPv4-Only VPN

**Your VPN provides:**
- IPv4: `203.0.113.45`
- IPv6: Not supported or disabled

**Configuration:**
```
Target IPv4: 203.0.113.45
Target IPv6: [Leave empty]
```

**What to expect:**
- ✅ IPv4 matches → **Green ✓**
- ❌ IPv4 doesn't match → **Red ✗**
- IPv6 is ignored (not checked)

**Best for**: IPv4-only VPNs, simple monitoring

---

### Example 3: IPv6-Only Network

**Your network provides:**
- IPv4: Not available
- IPv6: `2001:db8::1`

**Configuration:**
```
Target IPv4: [Leave empty]
Target IPv6: 2001:db8::1
```

**What to expect:**
- ✅ IPv6 matches → **Green ✓**
- ❌ IPv6 doesn't match → **Red ✗**
- IPv4 is ignored (not checked)

**Best for**: IPv6-only networks, modern infrastructure

---

### Example 4: Home Network Verification

**Your home network's public IPs:**
- IPv4: `198.51.100.25`
- IPv6: `2001:db8:home::1`

**Configuration:**
```
Target IPv4: 198.51.100.25
Target IPv6: 2001:db8:home::1
```

**What to expect:**
- ✅ At home → **Green ✓** (both IPs match)
- ⚠️ On VPN at home → **Orange ⚠** (partial match if VPN only affects one protocol)
- ❌ Away from home → **Red ✗** (different location)

**Best for**: Ensuring you're on trusted network

---

## Real-World Scenarios

### Scenario A: VPN DNS Leak Detection

**Setup:**
- VPN should route all traffic through `203.0.113.45` (IPv4) and `2001:db8::1` (IPv6)
- You configured both IPs in IP Guard

**Timeline:**
1. **5:00 PM** - Connect to VPN
   - Result: ✅ **Green ✓** - Perfect match! IPv4 ✓ & IPv6 ✓

2. **5:15 PM** - VPN IPv6 connection drops
   - Result: ⚠️ **Orange ⚠** - IPv6 mismatch detected!
   - Your real IPv6 is now exposed (DNS leak)

3. **5:20 PM** - You notice the warning and reconnect VPN
   - Result: ✅ **Green ✓** - Back to perfect match

**Benefit**: Caught the IPv6 leak immediately!

---

### Scenario B: Travel Security

**Setup:**
- Home network: IPv4 `198.51.100.25`, IPv6 `2001:db8:home::1`
- Coffee shop: Different IPs
- You configured home IPs

**Timeline:**
1. **Morning** - At home
   - Result: ✅ **Green ✓** - Perfect match!

2. **Afternoon** - At coffee shop, forgot to connect VPN
   - Result: ❌ **Red ✗** - IP mismatch detected
   - Reminder to connect VPN!

3. **Afternoon** - Connected VPN to simulate home IP
   - Result: Depends on VPN configuration

**Benefit**: Immediate notification when leaving trusted network

---

### Scenario C: VPN Server Switching

**Setup:**
- VPN Server A: `203.0.113.45` (configured in IP Guard)
- VPN Server B: `203.0.113.99` (different server)

**Timeline:**
1. **Start** - Connected to Server A
   - Result: ✅ **Green ✓** - IPv4 ✓

2. **Later** - VPN auto-switches to Server B
   - Result: ❌ **Red ✗** - IPv4 mismatch
   - You notice you're on wrong server

3. **Fix** - Manually reconnect to Server A
   - Result: ✅ **Green ✓** - Back on correct server

**Benefit**: Ensures you stay on your intended VPN server

---

## Badge Status Quick Reference

| Badge | Color | Meaning | Action Needed |
|-------|-------|---------|---------------|
| ✓ | Green | All good! | None - keep monitoring |
| ⚠ | Orange | **DNS LEAK** or partial match | Check VPN config immediately |
| ✗ | Red | IPs don't match | Reconnect VPN or check network |
| ! | Gray | Network error | Check internet connection |
| (empty) | - | Not configured yet | Set up target IPs |

---

## Tips for Best Security

### 1. Configure Both IPv4 and IPv6
If your VPN supports both, configure both for complete leak detection.

### 2. Monitor the Badge
Keep an eye on the extension badge - orange ⚠ means potential leak!

### 3. Check Immediately After Connecting
Click "Check Now" right after connecting to VPN to verify.

### 4. Don't Ignore Warnings
Orange ⚠ warnings indicate partial matches - this is a security concern!

### 5. Regular Monitoring
The extension checks every 2 minutes automatically - let it run.

---

## Common Questions

**Q: What if I only want to check IPv4?**
A: Leave the IPv6 field empty. Only IPv4 will be monitored.

**Q: What's more serious - Orange ⚠ or Red ✗?**
A: Both are concerns. Orange often indicates subtle DNS leaks (sneakier), while Red indicates obvious disconnection.

**Q: Can I check multiple VPN servers?**
A: Not simultaneously. Change the target IPs when switching servers.

**Q: What if my ISP changes my IP?**
A: You'll see Red ✗. Update your target IPs if you're checking your home network.

**Q: Does this work with all VPNs?**
A: Yes! It works independently of your VPN software by checking your actual public IPs.

---

## Status Flow Chart

```
[Extension Starts]
       ↓
[Configured IPs?] ──No──> ⚠️ "Configure IPs"
       ↓ Yes
[Check IPv4 & IPv6]
       ↓
[Compare to Targets]
       ↓
├─ All Match ──────────────> ✅ Green ✓
├─ Partial Match ──────────> ⚠️ Orange ⚠ (DNS LEAK!)
├─ No Match ───────────────> ❌ Red ✗
└─ Network Error ──────────> ! Gray !
```

---

**Remember**: The goal is to keep that badge **green ✓** for maximum security!
