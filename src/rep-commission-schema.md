# Rep Commission Schema — Final

## Pricing
- online_audit_price: $39 (no rep commission)
- inperson_audit_price: $99 (rep earns $60)
- monthly_monitor: $49/mo (rep earns $15/mo)
- pro_monitor: $79/mo (rep earns $20/mo)
- pro_plus_review_booster: $99/mo (rep earns $30/mo)

## Commission Status Types
- **pending**: payment succeeded, within 7-day buffer or waiting for payout date
- **approved**: payout date reached, ready to pay
- **paid**: rep has been paid
- **held**: customer payment failed, do not pay
- **cancelled**: customer churned, commission voided
- **clawback**: chargeback filed, commission reversed

## Buffer Status Types
- **buffering**: within 7-day hold period after customer payment
- **released**: buffer cleared, eligible for weekly payout batch
- **held**: payment issue during buffer, frozen
- **cancelled**: refund/chargeback during buffer, voided

## Payment Buffer Policy

### One-Time Audit Commissions ($60)
- Buffer period: 7 days from payment date
- Reason: Stripe settlement + dispute window
- If chargeback filed during buffer: commission cancelled
- If refund issued during buffer: commission cancelled

### Monthly Subscription Commissions ($15-30)
- Buffer period: 7 days from successful billing date
- Only released after successful Stripe charge confirmed
- If payment fails: commission held, not cancelled (customer may fix card)
- If customer cancels before buffer clears: commission cancelled
- If customer cancels after buffer clears: commission paid for that month, stops next month

### Chargeback Protection
- Any chargeback filed = immediate commission hold
- If chargeback won by customer = commission cancelled
- If chargeback won by company = commission releases after resolution

### Buffer Status Flow
```
customer_paid → buffering (7 days) → released → pending_approval → approved → paid
```

### Minimum Payout
- $20 minimum per weekly payout
- Amounts under $20 roll to next week automatically
- No maximum payout limit

## Commission Lifecycle
```
Customer pays
  ↓
7-day buffer period — commission locked
  ↓
No dispute or chargeback filed
  ↓
Commission releases into weekly batch
  ↓
Admin approves Monday payout
  ↓
Rep gets paid
```

### Failure Path
```
Payment fails → Commission: HELD
  ↓
Customer fixes card → Commission: PENDING → APPROVED → PAID
  ↓
Customer doesn't fix → Commission: CANCELLED
```

## Chargeback Policy

### Clawback Rules
- Any chargeback filed by a customer on an audit sold by Representative results in:
  - Immediate commission cancellation
  - Clawback of commission from next weekly payout if already paid
  - Formal warning issued to Representative
- Normal customer cancellations do NOT result in clawback of already paid commissions
- Clawbacks ONLY occur for: chargeback, fraud/misrepresentation, refund within buffer
- Subtract clawback amounts from weekly payout before processing
- If clawbacks exceed payout amount, carry negative balance to next week
- Rep sees clawback line items clearly on their commission statement

### Three Strikes Policy
- **Strike 1**: Written warning, mandatory retraining required
- **Strike 2** (within 90 days of Strike 1): Account suspended pending review
- **Strike 3** (at any time): Permanent deactivation, all pending commissions forfeited, no appeal

### Clawback Notice Example
```
CLAWBACK NOTICE
Customer: Joe's Pizza Dallas
Reason: Customer filed chargeback
Original commission: $60
Amount clawed back: $60
Applied to: Week of April 7 payout
Remaining payout this week: $120

This is strike 1 of 3.
Please review our conduct guidelines.
```

## Payout Schedule
- Frequency: Weekly every Monday
- Cutoff: Sunday midnight
- Only includes: cleared payments, no disputes, account in good standing
- Minimum payout: $20 (commissions under $20 roll to next week)
- Method: Manual approval by admin before release

## W-9 / Tax Requirements
- Alert when ytd earnings reach $500
- Hold payouts when ytd earnings reach $600 and w9_submitted is false
- 1099-NEC issued for all reps earning over $600 annually
- Reps are independent contractors, not employees
- The Agency LLC does not withhold taxes

## Stripe Webhook Integration

### Events To Handle

#### payment_intent.succeeded (audit)
- Create $60 commission
- Start 7-day buffer
- Alert rep: audit commission buffering

#### charge.dispute.created
- Find customer by stripe_customer_id
- Find rep by customer rep_code
- Set commission status = clawback
- Set buffer_status = held
- Increment rep chargeback_count and chargeback_strikes
- Create rep_alert type = chargeback_warning
- Send rep email: "A customer filed a chargeback. Your commission has been reversed."
- Send admin email: "Chargeback received — rep [name] customer [business]"
- Check strike level:
  - Strike 1: warning email only
  - Strike 2: suspend rep account, email rep
  - Strike 3: terminate rep account, forfeit all pending commissions

#### charge.dispute.closed (won by merchant)
- Remove clawback from commission
- Restore commission to pending status
- Decrement chargeback_strikes by 1
- Alert rep: commission restored

#### charge.dispute.closed (won by customer)
- Confirm clawback permanently
- Commission status = cancelled
- Alert rep: chargeback confirmed

#### invoice.payment_failed
- Find customer subscription and rep
- Set monthly commission = held
- Create rep_alert type = payment_failed
- Send rep email with customer name and SMS template
- Start 14-day resolution countdown

#### invoice.payment_succeeded
- Find customer and rep
- Create new monthly commission record
- Set buffer_start_date = today, buffer_release_date = today + 7 days
- Set buffer_status = buffering
- Alert rep: monthly commission buffering

#### customer.subscription.deleted
- Stop future monthly commissions
- Do NOT clawback already paid commissions
- Create rep_alert type = customer_cancelled
- Alert rep: customer cancelled, monthly commission stops

#### refund.created
- Cancel commission if in buffer
- Clawback if already paid
- Alert rep

### Stripe Metadata (always store on payments)
- rep_code
- customer_id
- plan_type
- transaction_type

### Webhook Safety
- Always verify Stripe webhook signature
- Always check stripe_event_id for duplicates before processing

## Database Tables

### rep_accounts (reps)
- id, user_id, full_name, email, phone, city
- rep_code (unique 6 char uppercase)
- commission_audit: 60
- commission_monthly_monitor: 15
- commission_pro_monitor: 20
- commission_pro_plus: 30
- total_earned_ytd (resets Jan 1)
- total_paid_lifetime
- chargeback_count (integer default 0)
- chargeback_strikes (integer default 0)
- last_chargeback_at (timestamp)
- w9_submitted (boolean), w9_submitted_at
- tax_year_1099_sent
- annual_earnings_ytd
- agreement_signed (boolean), agreement_signed_at
- agreement_ip_address, agreement_full_name
- contractor_acknowledgment (boolean)
- chargeback_acknowledgment (boolean)
- is_active
- suspension_reason, suspended_at, reactivated_at
- approved_at, approved_by
- status (active/pending/suspended/deactivated/terminated)
- created_at, updated_at

### rep_commissions
- id, rep_id, audit_id, customer_id
- customer_email, customer_name, business_name
- transaction_type (audit/monthly)
- plan_type (monitor/pro/pro_plus)
- product_type (one_time_audit/monthly_monitor/pro_monitor/pro_plus)
- amount_charged (sale_amount)
- commission_amount
- buffer_start_date
- buffer_release_date (start + 7 days)
- buffer_status (buffering/released/held/cancelled)
- payment_status (customer_paid/payment_failed/refunded/chargeback)
- held_reason (null/payment_failed/customer_churned/refund/chargeback)
- clawback_amount, clawback_reason, clawback_at
- payout_id (links to rep_payouts)
- status (pending/approved/paid/held/cancelled/clawback)
- created_at, updated_at

### rep_payouts
- id, rep_id
- week_start_date, week_end_date
- total_amount
- clawback_deductions
- final_payout_amount
- audit_count, monthly_count
- commission_ids (array of commission IDs included)
- status (pending_approval/approved/processing/paid/cancelled/held)
- requested_at
- approved_at, approved_by
- paid_at
- payment_method (stripe/manual/venmo/zelle)
- payment_reference
- notes
- created_at

### rep_alerts
- id, rep_id, customer_id, customer_email
- alert_type (payment_failed/chargeback_warning/account_suspended/account_terminated/payout_ready/w9_required/clawback_processed/customer_cancelled/customer_at_risk)
- message
- is_read (boolean)
- created_at

### webhook_logs
- id
- stripe_event_id (unique — prevents duplicates)
- event_type
- rep_id (if applicable)
- customer_id (if applicable)
- commission_id (if applicable)
- processed_at
- success (boolean)
- error_message
- raw_payload (JSONB)
- created_at

## Weekly Payout Batch Rules
- Run Sunday midnight
- Only include buffer_status = released
- Only include payment_status = customer_paid (cleared)
- No active chargebacks
- Subtract any clawback amounts
- Minimum $20 to trigger payout
- Negative balance carries to next week
- Admin must manually approve before release
