// Fictional chapter content. Each feature: [title, description]. img = public/img slot (optional).
const rows = (s) => s.trim().split('\n').map((l) => l.split('|').map((x) => x.trim()));
export const chapters = [
  { id: 'muse', name: 'Muse', lead: "The assistant that knows your shop as well as you do, and never sleeps on a launch.", img: 'muse',
    f: rows(`
Drafts that sound like you|Muse writes product copy in your voice after reading ten of your own listings.
Ask the ledger|Question your sales in plain words and get a chart, a table or a one-line answer.
Bulk edits by description|Describe a change to a thousand products and review it before it ships.
Scheduled hunches|Muse watches a metric overnight and leaves a note when something drifts.
Theme tweaks in chat|Move a section, swap a palette, preview, publish. All from one thread.
Voice notes to tasks|Dictate on the shop floor; tasks land in the right queue.`) },
  { id: 'envoy', name: 'Envoy', lead: "Sell inside conversations, with tools that keep stock, price and tax honest everywhere.", img: 'envoy',
    f: rows(`
Chat checkout|Shoppers complete a purchase without leaving the conversation they started in.
One catalogue feed|Publish a single product feed that every assistant can read.
Policy-aware answers|Returns, shipping and sizing answers come straight from your own policies.
Attribution you can read|See which conversations led to orders, with the exact turn that converted.
Agent-safe pricing|Set floors so no automated negotiation drops below margin.
Handoff to a human|Pass a thread to your team with the full context attached.`) },
  { id: 'storefront', name: 'Storefront', lead: "Test changes with real traffic and let the quieter version win.", img: 'storefront',
    f: rows(`
Split tests for sections|Run two layouts side by side and read the result with a confidence range.
Theme blocks|Compose pages from small blocks that keep their style when moved.
Faster first paint|Pages render the above-the-fold section before scripts finish loading.
Locale-aware layouts|Right-to-left and long-word languages reflow without manual fixes.
Preview links|Share a draft with a stakeholder, expiring after seven days.
Image focus points|Choose the part of a photo that must never be cropped.`) },
  { id: 'counter', name: 'Counter', lead: "In-store hardware that keeps working when the network does not.", img: 'counter',
    f: rows(`
Offline sales|Keep ringing up orders through an outage and sync when you reconnect.
Tap-to-pay reader|A pocket reader that pairs in one tap and charges overnight.
Staff shifts|Assign roles per shift and see sales by person.
Receipts by message|Send a receipt to a phone number or an email in two taps.
Endless aisle|Order out-of-stock items from another location while the customer waits.
Drawer reports|Close the day with a single reconciled summary.`) },
  { id: 'campaigns', name: 'Campaigns', lead: "A product network that puts your catalogue in front of people already looking.", img: 'campaign',
    f: rows(`
Audience from orders|Build a segment from what people bought, not what they clicked.
Creative variants|Generate three layouts from one photo and keep the strongest.
Budget guardrails|Cap spend per day and pause automatically on poor return.
Email sequences|Welcome, browse and win-back flows ship as editable templates.
Link cards|Preview how a product link will look in each chat app before posting.
Cohort reports|Compare first-time buyers month by month.`) },
  { id: 'checkout', name: 'Checkout', lead: "Personal checkout that converts without feeling pushed.", img: 'checkout',
    f: rows(`
Saved details everywhere|Returning shoppers skip straight to payment on any store.
Post-purchase add-ons|Offer a related item after payment without a second form.
Local payment methods|Show the bank transfer or wallet people in each country actually use.
Delivery promises|Display a real arrival date based on carrier cut-off times.
Tax-inclusive display|Show totals that already include duty and tax.
Cart notes|Let buyers add a gift message that prints on the slip.`) },
  { id: 'ledger', name: 'Ledger', lead: "Flexible inventory and fulfilment tools for the unglamorous half of retail.", img: 'ledger',
    f: rows(`
Transfers with reasons|Move stock between places and record why.
Bundles that count|Sell a set while each part keeps its own stock level.
Pick routes|Walk the warehouse in the shortest order for the day's orders.
Low-stock whispers|A quiet notice, not an alarm, when a bestseller dips under its floor.
Supplier reorders|Draft a purchase order from the sales rate in one click.
Audit trail|Every stock change shows who made it and from where.`) },
  { id: 'pocket', name: 'Pocket', lead: "Reach shoppers who open an app before they open a browser.", img: 'pocket',
    f: rows(`
Follow a shop|Shoppers follow you once and see new drops in a personal feed.
Order tracking|One timeline for every parcel, whichever carrier moves it.
Back-in-stock pings|Notify only the people who asked, only once.
Wishlist signals|See which products are saved most before you reorder.
Reviews with photos|Verified buyers can attach pictures to their rating.
Loyalty stamps|Digital stamp cards with no sign-up screen.`) },
  { id: 'trade', name: 'Trade', lead: "Take your wholesale business across borders and onto the same platform.", img: 'trade',
    f: rows(`
Company accounts|Buyers, approvers and billing contacts under one profile.
Tiered price lists|Show different prices by company, volume or region.
Net terms|Offer thirty-day terms with automatic reminders.
Quote requests|Let buyers propose a price and settle it in the thread.
Reorder lists|One click to repeat last quarter's order.
Tax exemption upload|Collect and store resale certificates once.`) },
  { id: 'vault', name: 'Vault', lead: "Modern financial tools for shops that are growing faster than their spreadsheets.", img: 'vault',
    f: rows(`
Instant payouts|Move yesterday's sales to your bank in minutes, any day of the week.
Cash flow forecast|See a rolling six-week projection built from your own history.
Capital offers|Fixed fee, no interest, repaid as a share of daily sales.
Business card|Spend with automatic category tags for each purchase.
Currency holdings|Keep earnings in the currency you pay suppliers in.
Dispute helper|Gather evidence for a chargeback in one tidy file.`) },
  { id: 'parcel', name: 'Parcel', lead: "Ship with confidence and at a speed that surprises people.", img: 'parcel',
    f: rows(`
Cheaper labels|Rates negotiated for small senders, applied automatically.
Pickup scheduling|Book a collection for a whole day's parcels.
Return labels in the box|Print a prepaid return slip with every order.
Customs forms|Fill duty forms from the product data you already have.
Packing suggestions|Choose the smallest box that fits the order.
Delay alerts|Warn buyers before they have to ask where it is.`) },
  { id: 'build', name: 'Build', lead: "A new way to build for commerce, with fewer seams between your code and the platform.", img: null,
    f: rows(`
Typed checkout hooks|Extend checkout with functions that run in a sandbox and return in milliseconds.
Cart line metadata|Attach structured data to a line and read it in every later step.
Hot reload for extensions|See edits in the browser without a rebuild or reinstall.
Webhooks with replay|Re-send any event from the last thirty days.
Order review function|Flag orders that meet your conditions before they are accepted.
Customer sign-in for apps|One authentication flow shared by the storefront and third-party apps.
Analytics queries|Query metrics and dimensions through one typed endpoint.
Inventory references|Link every adjustment to the document that caused it.
Payment terms function|Change terms and deposits dynamically per customer.
Dev console in admin|Errors, logs and QR deep links in one in-app panel.`) },
];
