# Multi-Tenancy Architecture Testing Guide

> Complete end-to-end testing scenarios for FlowForge multi-tenancy migration
> Version: 1.0.0
> Last Updated: 2025-01-18

## Overview

This guide provides comprehensive testing procedures for both user types (Consultant and Company) in the new multi-tenancy architecture.

## Prerequisites

- Local development environment running (`npm run dev`)
- Access to Supabase dashboard for data verification
- Email configured for authentication (or skip email verification in Supabase settings)

---

## Test Scenario 1: Consultant User Journey

### Step 1: Consultant Signup

1. Navigate to `/auth/signup`
2. Select **"Consultant"** user type (should highlight with peach border)
3. Fill in signup form:
   - Full Name: "Jane Consultant"
   - Email: Your test email
   - Password: (8+ characters)
   - Confirm Password: (match)
4. Click "Create Account"
5. **Verify**: Redirect to login page with success message

**Expected Result**: User account created with `user_type = 'consultant'` in `user_profiles` table

---

### Step 2: Consultant Login & Dashboard

1. Navigate to `/auth/login`
2. Enter credentials and sign in
3. **Verify Dashboard Elements**:
   - Header shows "FlowForge Dashboard"
   - Subtitle: "Multi-Disciplinary Consulting Platform"
   - "Companies" button visible in header
   - "Create Campaign" button visible
   - User menu shows your name and "consultant" badge
   - Quick stats cards display: Companies, Total Campaigns, Active Running
   - Empty state shows "No campaigns yet"

**Expected Result**: Full dashboard loads with all navigation elements

---

### Step 3: Create First Company Profile

1. Click "Companies" button in header OR "Manage Companies" in empty state
2. Click "Create Company" button
3. Fill in company form:
   - **Company Name**: "Acme Manufacturing"
   - **Industry**: "Manufacturing"
   - **Description**: "Mid-size automotive parts manufacturer"
   - **Market Scope**: Select "National"
   - **Website**: "https://acme-mfg.com"
   - **Headquarters**: "Detroit, MI"
   - **Employee Count**: "201-500"
   - **Annual Revenue**: "$50M-$100M"
4. Click "Create Company"
5. **Verify**: Redirect to companies list, Acme Manufacturing appears

**Expected Result**: Company profile created, visible in list with all details

---

### Step 4: View Company Detail Page

1. Click on "Acme Manufacturing" card
2. **Verify Company Detail Page Shows**:
   - Company name and industry in header
   - "Edit Company" button
   - Company information card with all details (website, location, size, etc.)
   - Stats cards: "0 Stakeholders", "0 Campaigns"
   - Empty stakeholders section with "Add Stakeholder" button
   - Empty campaigns section with "Create Campaign" button

**Expected Result**: Clean, organized company detail page

---

### Step 5: Add Stakeholders to Company

1. On company detail page, click "Add Stakeholder"
2. **Stakeholder 1 - Managing Director**:
   - Full Name: "John Smith"
   - Email: "john.smith@acme-mfg.com"
   - Role Type: "Managing Director"
   - Job Title: "CEO"
   - Department: "Executive"
3. Click "Add Stakeholder"
4. **Verify**: Redirect to company page, stakeholder appears in list

5. Click "Add Stakeholder" again
6. **Stakeholder 2 - IT Manager**:
   - Full Name: "Sarah Johnson"
   - Email: "sarah.johnson@acme-mfg.com"
   - Role Type: "IT Operations"
   - Job Title: "IT Director"
   - Department: "Information Technology"
7. Click "Add Stakeholder"

8. Add 2 more stakeholders with different roles (Production Manager, Planning & Scheduler)

**Expected Result**: Company detail page shows 4 stakeholders with edit links

---

### Step 6: Edit Stakeholder Profile

1. Click "Edit" on one of the stakeholders
2. Update the job title
3. Click "Save Changes"
4. **Verify**: Redirect to company page, changes reflected

**Expected Result**: Stakeholder profile updates successfully

---

### Step 7: Create Campaign for Client

1. From company detail page, click "Create Campaign" OR navigate via dashboard
2. **Verify Campaign Creation Form**:
   - Company dropdown shows "Acme Manufacturing" (pre-selected if coming from company page)
   - Campaign name field
   - Facilitator fields (your name/email)
   - Description field

3. Fill in campaign:
   - **Company**: Select "Acme Manufacturing"
   - **Campaign Name**: "Q1 2025 Industry 4.0 Readiness Assessment"
   - **Facilitator Name**: Your name
   - **Facilitator Email**: Your email
   - **Description**: "Initial digital transformation assessment"

4. **Verify Stakeholder Selection Section**:
   - Shows "Select from existing stakeholders:" with 4 stakeholder cards
   - "Add New Stakeholder" button visible

5. **Select Existing Stakeholders**:
   - Click on John Smith card (should highlight with peach border)
   - Click on Sarah Johnson card
   - **Verify**: Both appear in "Selected stakeholders" list below

6. **Add New Stakeholder Inline**:
   - Click "Add New Stakeholder"
   - Fill in: "Mike Williams", "mike@acme-mfg.com", Role: "Production Manager"
   - Click "Add to Campaign"
   - **Verify**: Appears in selected list with "(New)" badge

7. Click "Create Campaign & Send Invitations"
8. **Verify**: Redirect to campaign detail page

**Expected Result**:
- Campaign created with 3 stakeholders
- Mike Williams added as new stakeholder profile to company
- All campaign assignments created with unique access tokens

---

### Step 8: Create Second Company

1. Navigate to Companies
2. Create another company: "TechCorp Industries"
3. Add 2-3 stakeholders to TechCorp
4. Create a campaign for TechCorp
5. **Verify Dashboard**:
   - Shows 2 campaigns
   - Companies quick stat shows multiple companies
   - Campaign list displays both companies

**Expected Result**: Consultant can manage multiple client companies independently

---

## Test Scenario 2: Company User Journey

### Step 1: Company User Signup

1. **Logout** from consultant account
2. Navigate to `/auth/signup`
3. Select **"Company"** user type
4. Fill in signup form:
   - Full Name: "Robert Manager"
   - Email: Different test email
   - Password: (8+ characters)
5. Click "Create Account"
6. Login with new credentials

**Expected Result**: User created with `user_type = 'company'`

---

### Step 2: Company User Dashboard

1. **Verify Dashboard**:
   - Same layout as consultant
   - Empty state prompts to create company

**Expected Result**: Company user sees dashboard but no data yet

---

### Step 3: Company Creates Their Company Profile

1. Navigate to Companies
2. Create company profile: "Manufacturing Solutions Inc"
3. Fill in all company details
4. **Verify**: User redirected to company list

**Expected Result**: Company profile created and linked to user via `user_profiles.company_profile_id`

---

### Step 4: Company Adds Their Team

1. View company detail page
2. Add stakeholders representing their internal team:
   - Operations Manager
   - IT Director
   - Production Supervisor
3. **Verify**: All team members appear

**Expected Result**: Company can build their stakeholder roster

---

### Step 5: Company Creates Campaign

1. Click "Create Campaign"
2. **Verify**: Company dropdown pre-filled with their company
3. Create campaign, select their team members
4. **Verify**: Campaign created successfully

**Expected Result**: Company user can create campaigns for their own organization

---

### Step 6: Verify Company User Limitations

1. Try to create another company profile
2. **Expected**: Company user should see they already have a company linked
3. Navigate to Companies list
4. **Verify**: Should only see their own company (RLS filtering)

**Expected Result**: Company users have limited scope compared to consultants

---

## Test Scenario 3: Interview Agent Context

### Step 1: Access Interview Session

1. From campaign detail page, copy a stakeholder's interview link
2. Open in incognito/private browser window
3. **Verify Session Page**:
   - Shows company name
   - Shows campaign name
   - Shows stakeholder name and role
   - "Begin Interview" button

**Expected Result**: Stakeholder can access interview via unique token

---

### Step 2: Test Interview Agent

1. Click "Begin Interview"
2. **Verify AI Greeting**:
   - Should mention stakeholder by name
   - Reference their role/title
   - Warm, professional tone

3. **Send test message**: "Tell me about my company"
4. **Verify AI Response Includes**:
   - Company name (Acme Manufacturing)
   - Industry context
   - Market scope
   - Company size information
   - Relevant department references

5. **Send role-specific question**: "What should I focus on in my role?"
6. **Verify AI Response**:
   - Tailored to stakeholder's role type
   - References Industry 4.0 concepts
   - Connects to company industry/size

**Expected Result**: Interview agent has full context and provides relevant, personalized questions

---

## Test Scenario 4: Data Integrity & RLS

### Verify Multi-Tenancy Isolation

1. **As Consultant**:
   - View Companies list
   - **Verify**: Can see all companies you created (Acme, TechCorp)

2. **As Company User** (different browser/incognito):
   - View Companies list
   - **Verify**: Only see "Manufacturing Solutions Inc"
   - Cannot see consultant's companies

3. **Campaigns Isolation**:
   - Each user only sees campaigns for companies they have access to

4. **Stakeholder Profiles**:
   - Stakeholders only appear under their respective companies
   - No cross-contamination between companies

**Expected Result**: Perfect data isolation per RLS policies

---

## Database Verification Checklist

After completing tests, verify in Supabase:

### user_profiles Table
- [ ] Consultant user has `user_type = 'consultant'`, `company_profile_id = null`
- [ ] Company user has `user_type = 'company'`, `company_profile_id = <their company ID>`

### company_profiles Table
- [ ] All companies created have correct `created_by` user ID
- [ ] Company data includes all profile fields

### stakeholder_profiles Table
- [ ] All stakeholders linked to correct `company_profile_id`
- [ ] No orphaned stakeholders
- [ ] Mike Williams (added inline) exists as reusable profile

### campaigns Table
- [ ] All campaigns have `company_profile_id`
- [ ] `company_name` matches company_profiles.company_name
- [ ] Old `organization_id` column removed

### campaign_assignments Table
- [ ] All assignments have `stakeholder_profile_id` (for existing) or stakeholder details (for new)
- [ ] Each assignment has unique `access_token`
- [ ] No references to old `stakeholder_sessions` table

---

## Success Criteria

✅ **All tests pass if**:
- Both user types can sign up with correct type selection
- Consultants can manage multiple client companies
- Company users can only manage their own company
- Stakeholder profiles are reusable across campaigns
- New stakeholders can be added inline during campaign creation
- Interview agent receives full company + stakeholder context
- RLS properly isolates data between companies
- No errors in browser console or server logs

---

## Troubleshooting

### Issue: Can't see company after creating
**Solution**: Check RLS policies in Supabase, verify `created_by` matches user ID

### Issue: Stakeholder not appearing in campaign creation
**Solution**: Verify stakeholder's `company_profile_id` matches selected company

### Issue: Interview agent lacks context
**Solution**: Check API response includes nested `company_profiles` and `stakeholder_profiles` data

### Issue: Company user sees other companies
**Solution**: RLS policy issue - verify company_profiles RLS filters by user's company_profile_id

---

## Next Steps After Testing

1. Document any bugs found in GitHub issues
2. Test edge cases (deleting stakeholders in use, etc.)
3. Performance testing with larger datasets
4. Email invitation sending (currently stubbed)
5. Test synthesis agent with completed interviews

---

*This testing guide ensures the multi-tenancy architecture is production-ready and all user workflows function correctly.*
