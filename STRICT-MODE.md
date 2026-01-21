# 🛡️ IP Guard - Strict Security Mode

## New Logic: Empty Field = Verify IP Does NOT Exist

### The Problem We're Solving

**Old Logic (Weak):**
- Leave IPv6 empty = "Skip IPv6 check"
- Result: IPv6 could be leaking and you wouldn't know

**New Logic (Strict Security):**
- Leave IPv6 empty = "Verify NO IPv6 exists"
- Result: Get warned if IPv6 is active when it shouldn't be

---

## How It Works

### Scenario 1: IPv4-Only VPN (No IPv6 Support)

**Configuration:**
```
Target IPv4: 203.0.113.45    ← Your VPN's IPv4
Target IPv6: [EMPTY]         ← Must be NO IPv6
```

**What Extension Checks:**
1. ✅ Does current IPv4 match `203.0.113.45`?
2. ✅ Is there NO IPv6 address detected?

**Possible Results:**

| Current IPv4 | Current IPv6 | Result | Meaning |
|--------------|--------------|--------|---------|
| `203.0.113.45` | None | 🟢 **Perfect!** | VPN working, no leaks |
| `203.0.113.45` | `2001:db8::99` | 🟠 **IPv6 LEAK!** | ⚠️ Your IPv6 is exposed! |
| `198.51.100.25` | None | 🔴 **Mismatch** | VPN not connected |
| `198.51.100.25` | `2001:db8::99` | 🔴 **Multiple Issues** | VPN failed + IPv6 leak |

---

### Scenario 2: Dual-Stack VPN (Both IPv4 and IPv6)

**Configuration:**
```
Target IPv4: 203.0.113.45    ← Your VPN's IPv4
Target IPv6: 2001:db8::1     ← Your VPN's IPv6
```

**What Extension Checks:**
1. ✅ Does current IPv4 match `203.0.113.45`?
2. ✅ Does current IPv6 match `2001:db8::1`?

**Possible Results:**

| Current IPv4 | Current IPv6 | Result | Meaning |
|--------------|--------------|--------|---------|
| `203.0.113.45` | `2001:db8::1` | 🟢 **Perfect!** | Both match perfectly |
| `203.0.113.45` | `2001:db8::99` | 🟠 **IPv6 Leak!** | IPv6 using wrong address |
| `203.0.113.45` | None | 🟠 **Warning** | IPv6 not working |
| `198.51.100.25` | `2001:db8::1` | 🟠 **IPv4 Leak!** | IPv4 using wrong address |

---

### Scenario 3: IPv6-Only Network

**Configuration:**
```
Target IPv4: [EMPTY]         ← Must be NO IPv4
Target IPv6: 2001:db8::1     ← Your network's IPv6
```

**What Extension Checks:**
1. ✅ Is there NO IPv4 address detected?
2. ✅ Does current IPv6 match `2001:db8::1`?

**Possible Results:**

| Current IPv4 | Current IPv6 | Result | Meaning |
|--------------|--------------|--------|---------|
| None | `2001:db8::1` | 🟢 **Perfect!** | Pure IPv6 as expected |
| `70.47.26.183` | `2001:db8::1` | 🟠 **IPv4 LEAK!** | ⚠️ Unexpected IPv4 detected! |
| None | `2001:db8::99` | 🔴 **Mismatch** | Wrong IPv6 address |

---

### Scenario 4: No IP Should Exist (Testing)

**Configuration:**
```
Target IPv4: [EMPTY]         ← Must be NO IPv4
Target IPv6: [EMPTY]         ← Must be NO IPv6
```

**What Extension Checks:**
1. ✅ Is there NO IPv4 address detected?
2. ✅ Is there NO IPv6 address detected?

**Possible Results:**

| Current IPv4 | Current IPv6 | Result | Meaning |
|--------------|--------------|--------|---------|
| None | None | 🟢 **Perfect!** | No network connectivity |
| `70.47.26.183` | None | 🟠 **IPv4 LEAK!** | Unexpected IPv4 |
| None | `2001:db8::1` | 🟠 **IPv6 LEAK!** | Unexpected IPv6 |
| `70.47.26.183` | `2001:db8::1` | 🔴 **Both Leaked!** | Both protocols active |

---

## Why This Matters for Security

### Real-World Example: IPv6 Leak

**You're using an IPv4-only VPN:**

```
Configuration:
  Target IPv4: 203.0.113.45 (VPN)
  Target IPv6: [EMPTY]
```

**Without strict checking:**
- ✅ IPv4 matches VPN
- 🤷 IPv6 not checked
- ❌ **Problem**: Your real IPv6 (`2001:db8:home::1`) is exposed!
- ❌ Websites can see your real location via IPv6

**With strict checking (NEW):**
- ✅ IPv4 matches VPN
- ⚠️ **IPv6 LEAK DETECTED**: `2001:db8:home::1`
- ✅ **You're alerted immediately!**

---

## Configuration Examples

### Example 1: Most Secure (Dual-Stack VPN)

```
✅ Target IPv4: 203.0.113.45
✅ Target IPv6: 2001:db8::1
```

**Checks:**
- IPv4 must be exactly `203.0.113.45`
- IPv6 must be exactly `2001:db8::1`
- Both protocols secured through VPN

---

### Example 2: IPv4-Only VPN (Strict)

```
✅ Target IPv4: 203.0.113.45
❌ Target IPv6: [EMPTY]
```

**Checks:**
- IPv4 must be exactly `203.0.113.45`
- IPv6 must NOT exist (any IPv6 = LEAK WARNING)
- Protects against IPv6 leaks

---

### Example 3: IPv6-Only (Rare but Valid)

```
❌ Target IPv4: [EMPTY]
✅ Target IPv6: 2001:db8::1
```

**Checks:**
- IPv4 must NOT exist
- IPv6 must be exactly `2001:db8::1`
- Pure IPv6 environment

---

## Understanding the Warnings

### 🟢 Green ✓ - Perfect Security
```
✓ IP Address Match
IPv4: 203.0.113.45
Perfect! IPv4 ✓, No IPv6 ✓
```
**Meaning**: Everything is exactly as configured. Secure!

---

### 🟠 Orange ⚠ - IP LEAK Detected
```
⚠ IP LEAK DETECTED!
IPv4: 203.0.113.45 | IPv6: 2001:db8:home::1
⚠ IPv6 LEAK: 2001:db8:home::1 detected (should be NONE)
```
**Meaning**: An IP exists when it shouldn't. **SECURITY RISK!**

**Action Required:**
1. Check VPN settings - is IPv6 routing disabled?
2. Disable IPv6 on your system if VPN doesn't support it
3. Switch to dual-stack VPN that supports IPv6

---

### 🔴 Red ✗ - Mismatch
```
✗ IP Mismatch
IPv4: 198.51.100.25
IPv4 mismatch: 198.51.100.25 ≠ 203.0.113.45
```
**Meaning**: IP doesn't match expected. VPN might be disconnected.

---

## Migration from Old Logic

### If you previously configured:

**Old Way:**
```
Target IPv4: 203.0.113.45
Target IPv6: [EMPTY] ← "Skip IPv6 check"
```

**New Behavior:**
- Now means: "Check that NO IPv6 exists"
- If you have IPv6, you'll get warnings

**What to do:**

**Option A:** If your VPN supports IPv6:
```
Target IPv4: 203.0.113.45
Target IPv6: [Your VPN's IPv6] ← Add this!
```

**Option B:** If IPv6 warnings are correct:
```
Target IPv4: 203.0.113.45
Target IPv6: [EMPTY] ← Keep empty, warnings are valid
```
Then disable IPv6 on your system or in VPN settings.

---

## Advanced: Troubleshooting Leaks

### IPv6 Leak Detected - What To Do

1. **Verify it's a real leak:**
   ```
   Visit: https://ipv6leak.com
   Visit: https://test-ipv6.com
   Compare with extension results
   ```

2. **Disable IPv6 (Windows):**
   ```
   Control Panel → Network Connections
   Right-click adapter → Properties
   Uncheck "Internet Protocol Version 6 (TCP/IPv6)"
   ```

3. **Disable IPv6 (Mac):**
   ```
   System Preferences → Network
   Advanced → TCP/IP
   Configure IPv6: Off
   ```

4. **VPN IPv6 Settings:**
   - Check if your VPN has IPv6 routing option
   - Enable "Block IPv6 when not using VPN"
   - Use VPN's IPv6 servers if available

---

## FAQ

**Q: I have both IPv4 and IPv6, should I configure both?**
A: YES! Configure both for maximum security. Leave empty only if you want to verify that protocol doesn't exist.

**Q: My VPN doesn't support IPv6, what should I do?**
A: Configure only IPv4, leave IPv6 empty. Extension will warn if IPv6 leaks.

**Q: I keep getting IPv6 leak warnings, is this bad?**
A: YES! This means your IPv6 is exposed. Disable IPv6 or use a VPN with IPv6 support.

**Q: Can I leave both empty?**
A: Yes, but only useful for testing "no network" scenarios.

**Q: What if I want the old "skip check" behavior?**
A: Not available - it's a security risk. Always verify IPs exist or don't exist.

---

## Security Best Practices

✅ **DO:** Configure both IPv4 and IPv6 if your VPN supports both

✅ **DO:** Leave IPv6 empty if your VPN is IPv4-only

✅ **DO:** Act immediately on IP leak warnings

✅ **DO:** Test after configuring to ensure green ✓

❌ **DON'T:** Ignore orange ⚠ warnings - they indicate leaks

❌ **DON'T:** Assume empty = "skip check" anymore

❌ **DON'T:** Use IPv4-only VPN if you need IPv6 access

---

**Remember**: Stricter checking = Better security. IP leaks defeat the purpose of VPNs!
