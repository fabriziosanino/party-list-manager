# 🚀 Google Play Store Publishing Guide

## Prerequisites
1. ✅ Google Play Console Developer Account ($25 one-time fee)
2. ✅ EAS CLI installed: `npm install -g @expo/eas-cli`
3. ✅ Expo account and project configured

## Step 1: Login to EAS
```bash
eas login
```

## Step 2: Build Production APK/AAB
```bash
# For AAB (recommended for Play Store)
eas build --platform android --profile production

# For testing APK
eas build --platform android --profile preview
```

## Step 3: Download Build
After build completes, download the `.aab` file from EAS dashboard or CLI.

## Step 4: Google Play Console Setup

### A. Create App Listing
1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - **App name**: Event Manager
   - **Default language**: Italian
   - **App/Game**: App
   - **Free/Paid**: Free
   - **Declarations**: Check appropriate boxes

### B. Upload APK/AAB
1. Go to "Production" → "Create release"
2. Upload your `.aab` file
3. Add release notes

### C. Store Listing
1. **App details**:
   - Short description: "Professional event management with QR codes and payment tracking"
   - Full description: [Use description from store-assets/REQUIREMENTS.md]

2. **Graphics**:
   - App icon: 512x512 (use assets/icon.png)
   - Screenshots: Create 2-8 phone screenshots
   - Feature graphic: 1024x500 (create this)

3. **Categorization**:
   - **Category**: Productivity or Business
   - **Tags**: event, management, productivity

### D. Content Rating
1. Complete content rating questionnaire
2. Should be rated for "Everyone" or "Everyone 3+"

### E. App Pricing & Distribution
1. **Countries**: Select countries where you want to distribute
2. **Pricing**: Free
3. **Content guidelines**: Confirm compliance

### F. Privacy Policy
1. Add link to your privacy policy
2. Upload the PRIVACY_POLICY.md to a web hosting service
3. Example URL: https://your-website.com/privacy-policy

## Step 5: Submit for Review
1. Complete all required sections
2. Submit for review
3. Review process typically takes 1-3 days

## Step 6: Update Commands (for future updates)
```bash
# Update app version in app.json
# Build new version
eas build --platform android --profile production

# Submit update
eas submit --platform android
```

## 📋 Checklist Before Submission
- [ ] App icon (512x512)
- [ ] Screenshots (2-8 phone screenshots)
- [ ] Feature graphic (1024x500)
- [ ] Privacy policy URL
- [ ] App description
- [ ] Content rating completed
- [ ] Countries selected
- [ ] APK/AAB uploaded
- [ ] Release notes added

## 🎯 Key Tips
1. **Screenshots**: Show your best features (party overview, guest list, QR scanning)
2. **Keywords**: Use relevant keywords in description for ASO
3. **Privacy**: Your app is privacy-friendly (local storage only)
4. **Testing**: Test thoroughly before submission
5. **Updates**: Regular updates improve store ranking

## 🔄 After Publishing
- Monitor reviews and ratings
- Respond to user feedback
- Plan regular feature updates
- Track download metrics in Play Console
