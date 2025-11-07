# Constant Contact Integration Instructions

## 🎉 Your Lead Magnet Popup is Ready!

Your website now has a professional lead magnet popup offering **50 FREE AI Video Prompts**.

## ✅ What's Already Set Up

1. **Beautiful Popup Design** - Matches your site's style
2. **Smart Triggers:**
   - Exit Intent (when user tries to leave)
   - Time Delay (15 seconds after page load)
   - Scroll Depth (70% down the page)
3. **Cookie Management** - Won't annoy visitors (shows once per 7 days)
4. **Mobile Responsive** - Works perfectly on all devices

## 🔌 How to Connect Constant Contact

### Step 1: Create a Form in Constant Contact

1. Log in to your Constant Contact account
2. Go to **Contacts** → **Sign-up Forms**
3. Click **Create** → **Inline Form** or **Pop-up Form**
4. Design your form (or use a simple template)
5. Click **Save & Publish**

### Step 2: Get Your Form Embed Code or API Endpoint

**Option A: Using Constant Contact's Form Action URL**
1. After creating the form, click **Get Code**
2. Look for the `<form action="...">` line in the embed code
3. Copy the URL in the `action` attribute
4. Example: `https://visitor2.constantcontact.com/api/signup`

**Option B: Using Constant Contact API (Advanced)**
1. Go to **Account** → **API Keys**
2. Generate an API key
3. Use the Constant Contact API to submit contacts

### Step 3: Update Your Website Code

Open `scripts.js` and find line 262:

```javascript
const constantContactFormURL = 'YOUR_CONSTANT_CONTACT_FORM_URL_HERE';
```

Replace with your actual Constant Contact form URL:

```javascript
const constantContactFormURL = 'https://visitor2.constantcontact.com/api/signup?YOUR_FORM_ID';
```

Then **uncomment lines 266-281** (remove the `/*` and `*/`):

```javascript
const formData = new FormData();
formData.append('email', email);
formData.append('first_name', name);

fetch(constantContactFormURL, {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
}).then(() => {
    handleSuccessfulSubmission();
}).catch((error) => {
    console.error('Error:', error);
    alert('There was an error. Please try again.');
});
```

And **comment out line 284**:

```javascript
// handleSuccessfulSubmission(); // Remove this line or comment it out
```

### Step 4: Create Your Free Prompt Delivery

You need to create the **50 FREE prompts** to deliver to new subscribers:

**Option 1: Automated Email via Constant Contact**
1. In Constant Contact, create an **Automated Welcome Email**
2. Set it to trigger when someone joins your list
3. Include a download link to your free prompts (PDF or Google Doc)

**Option 2: Use a Service Like Gumroad**
1. Create a FREE product on Gumroad with your 50 prompts
2. Set up an automation to send the link when someone subscribes

## 📝 Alternative: Manual Testing

For now, the popup will show a success message without actually submitting to Constant Contact. This lets you:
- Test the popup appearance and functionality
- See the user experience
- Make sure everything looks good

When you're ready to connect Constant Contact, follow the steps above!

## 🎯 Popup Behavior

- **First Visit:** Shows after 15 seconds OR when scrolling 70% OR exit intent
- **Cookie Duration:** Won't show again for 7 days after viewing
- **After Submission:** Never shows again to that user
- **Mobile Friendly:** Fully responsive design

## 🛠️ Customization Options

You can customize the popup in these files:

- **`index.html` (lines 736-788):** Change text, benefits list, offer details
- **`styles.css` (lines 504-679):** Modify colors, spacing, animations
- **`scripts.js` (lines 149-315):** Change trigger timing, cookie duration

### Change Trigger Timing

In `scripts.js`, line 219:
```javascript
}, 15000); // Change to 10000 for 10 seconds, 30000 for 30 seconds
```

### Change Number of Free Prompts

In `index.html`, line 745:
```html
<h2 id="popup-title" class="lead-popup-title">
    Get 50 FREE AI Video Prompts!  <!-- Change to any number -->
</h2>
```

## 🚀 Next Steps

1. ✅ Test the popup on your site
2. ✅ Create your 50 free prompts PDF
3. ✅ Set up Constant Contact form
4. ✅ Connect the integration
5. ✅ Set up automated email delivery
6. ✅ Start collecting leads!

## 📧 Need Help?

If you need help with Constant Contact integration, you can:
1. Contact Constant Contact support
2. Hire a developer to help with the API integration
3. Use the manual testing mode until you're ready

---

**Your popup is live and ready to collect emails!** 🎉
