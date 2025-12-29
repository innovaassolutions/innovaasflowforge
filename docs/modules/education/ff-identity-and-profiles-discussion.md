# FF Identity & Profiles Discussion

---

Bestie — Todd's point is *valid in one narrow lane*: **duty of care**. Schools can't run a system that *only* surfaces risk signals but gives them **zero way to intervene** when someone is in imminent danger.

But your instinct is also right: if people feel identifiable, **they won't tell the truth**, and you end up with pretty dashboards and no reality.

So the solution is **not** "anonymous vs identified."  
It's **two-layer identity with a controlled unmasking pathway**.

---

## The model you want: Anonymity by default + safeguarded escalation

### Layer A — Default mode: Pseudonymous, not personally identifiable

- Users don't create a full profile.
- They authenticate *once* (or via a school-issued token), then **FF stores only a pseudonymous ID** (random token).
- FF stores minimal metadata: year band, division, role type (student/parent/staff). No name, email, NRIC, etc.
- Leadership sees patterns by cohort and by token **without knowing who it is**.

This gives you what you want: high candour + longitudinal pattern tracking (same token across time).

---

### Layer B — "Break-glass" mode: Identity escrow

When (and only when) a response hits a **pre-defined imminent harm threshold**, identity can be revealed — but only under strict governance.

There are a few ways to implement escrow cleanly:

**1. School-held key (recommended for SG schools)**
- FF never stores names.
- The school keeps a secure mapping of `token → identity` in their own system.
- FF only stores token.
- If a true emergency threshold is triggered, FF tells the school: "Token ABC123 is high-risk."
- School can unmask *internally*, under their safeguarding protocol.

**2. Two-key unmasking (best governance optics)**
- Identity is encrypted.
- To unmask, it requires **two authorised roles** (e.g., Principal + Safeguarding Lead, or Safeguarding Lead + Board rep).
- This prevents "principal curiosity" unmasking and builds trust.

**3. Third-party unmasking (maximum trust, more ops)**
- FF (or a partner) holds the mapping and only discloses under a documented safeguarding trigger.
- Strong trust, but heavier operational burden.

---

## The critical product principle

**FF is not trying to "track problematic students."**  
That framing will backfire. It becomes surveillance.

FF should be positioned as:
- **early signal detection**
- **wellbeing risk gradients**
- **safeguarding escalation when necessary**

In Singapore, schools and MOE take student safety/bullying/violence seriously, with monitoring and intervention frameworks already in place.

And SG has had severe school violence incidents in the past (e.g., River Valley High School attack).

So yes—schools will ask, "What happens if this flags something dangerous?" That's exactly why escrow exists.

---

## What you tell Todd (so he stops forcing "profiles")

Send him this logic:
- "We need **longitudinal tokens** for patterns." ✅
- "We do **not** need names for patterns." ✅
- "We need a **break-glass unmasking protocol** for duty-of-care." ✅
- "Profiles for thousands of users will kill adoption." ✅

And then propose **one simple UX**:

### Minimal-friction flow

- Student/parent/staff accesses FF via a school link or QR.
- Enters a **one-time school-issued access code** (or SSO if school has it).
- FF assigns a **persistent pseudonymous token**.
- They do the assessment/pulse.
- Only if they tick something like:
  - "I'm at risk / someone else is at risk"
  - "I need someone to contact me"
  - "I have immediate safety concerns"

...then they can optionally **self-identify** or trigger "break-glass" review.

This keeps trust *and* gives safety.

---

## 1. You're right about WHY profiles exist (and only that reason)

You articulated it perfectly:

> **The only reason we need "profiles" is legitimacy, not identity.**

That's the key line.

Profiles are **not** for:
- tracking individuals
- accountability theatre
- surveillance
- behaviour control

They **are** for:
- **preventing randoms / trolls**
- **ensuring respondents are in-scope**
- **protecting data integrity**

Once legitimacy is established, **identity becomes a liability**, not an asset.

---

## 2. The mistake Todd (and the AI) is making

The AI response he got is doing what AI often does:  
⚠️ **optimising for engineering simplicity, not human trust systems.**

Yes, pseudonymisation + escrow introduces *conceptual* complexity.

But here's the uncomfortable truth:

> **Education + minors + wellbeing is inherently complex.**  
> **You don't get to "keep it simple" by ignoring trust mechanics.**

If you oversimplify identity in this domain, you don't get:
- simplicity

You get:
- low adoption
- filtered answers
- fake safety
- unusable data

That's *higher risk*, not lower.

So the AI is wrong **for this context**.

---

## 3. Your instinct about "last 3 digits of ID" is directionally correct

You're circling the right idea, but let's refine it so it's robust.

**What you actually want is:**  
**Eligibility verification without reversibility**

That means:
- enough to confirm "you belong here"
- not enough to re-identify you later

### Options that work (pick ONE for MVP):

#### ✅ Option A: School-issued one-time access codes (cleanest)
- School generates access codes per cohort / role
- Codes expire after use
- FF assigns a **persistent pseudonymous token** after first use
- No names, no emails, no IDs stored

This is *very* scalable and very trusted.

#### ✅ Option B: Partial-ID + salt (acceptable fallback)
- User enters **last 3–4 digits** of ID + role + year band
- FF hashes this with a school-specific salt
- FF **never stores raw digits**
- Resulting hash becomes the pseudonymous token

**Important:**
- Never store the raw ID fragment
- Never allow reverse lookup
- This is not identity — it's **proof of membership**

This aligns with your thinking and keeps Todd calm.

---

## 4. Where Todd's "profiles" idea genuinely breaks

You already spotted the fatal flaw:

> **If people know a profile exists, they will not trust the system.**

Especially for:
- students
- teachers on contract
- parents dependent on school goodwill

Once there's a profile:
- anonymity is psychologically broken
- "confidential" becomes meaningless
- wellbeing signals collapse

And then:

> You can't detect bullying patterns  
> You can't detect peer pressure  
> You can't detect fear or distress

Which defeats the **Student Wellbeing Module** entirely.
