# Rep Commission Schema

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

## Payout Schedule
- Frequency: Weekly every Monday
- Cutoff: Sunday midnight
- Only includes: cleared payments, no disputes, account in good standing
- Minimum payout: $20 (commissions under $20 roll to next week)
- Method: Manual approval by admin before release

## W-9 / Tax Requirements
- Reps earning over $600/year require W-9 on file before payouts continue
- System flags automatically when cumulative earnings approach $600
- 1099-NEC issued for all reps earning over $600 annually
- Reps are independent contractors, not employees
- The Agency LLC does not withhold taxes

## Database Tables

### reps
- id, user_id, full_name, email, phone
- rep_code (unique)
- commission_audit: 60
- commission_monthly_monitor: 15
- commission_pro_monitor: 20
- commission_pro_plus: 30
- total_earned, total_paid, total_earned_ytd (resets Jan 1)
- w9_submitted (boolean), w9_submitted_at
- agreement_signed (boolean), agreement_signed_at
- agreement_ip_address, agreement_full_name
- contractor_acknowledgment (boolean)
- approved_at, approved_by
- status (active/pending/deactivated)
- created_at, updated_at

### rep_commissions
- id, rep_id, audit_id
- customer_email, customer_name, business_name
- product_type (one_time_audit/monthly_monitor/pro_monitor/pro_plus)
- sale_amount, commission_amount
- status (pending/approved/paid/held/cancelled)
- payment_status (customer_paid/payment_failed/refunded)
- held_reason (null/payment_failed/customer_churned/refund/chargeback)
- buffer_release_date (payment_date + 7 days)
- buffer_status (buffering/released/held/cancelled)
- cleared_at, paid_at
- created_at, updated_at

### rep_payouts
- id, rep_id
- week_start_date, week_end_date
- total_amount
- commission_ids (array of commission IDs included)
- status (pending_approval/approved/processing/paid/cancelled)
- requested_at, approved_at, approved_by
- paid_at
- payment_method (stripe/manual/venmo/zelle)
- payment_reference
- notes
- created_at

### rep_alerts
- id, rep_id, customer_email
- alert_type (payment_failed/customer_at_risk/commission_held/payout_ready/w9_required)
- message
- is_read (boolean)
- created_at
