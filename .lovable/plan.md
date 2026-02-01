
# PDF থেকে অটো ভোটার ডাটা এক্সট্র্যাক্ট - প্ল্যান

## সারসংক্ষেপ
PDF আপলোড করলে **Lovable AI (Gemini)** ব্যবহার করে অটোমেটিক ভোটার তথ্য বের করে ডাটাবেসে যোগ করা হবে। তোমার আলাদা Gemini API key দেওয়ার দরকার নেই - Lovable AI তে Gemini already built-in আছে!

---

## কীভাবে কাজ করবে

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PDF আপলোড     │ ──▶ │  Gemini AI      │ ──▶ │  ডাটাবেসে সেভ   │
│   (Admin Panel) │     │  (Extract Data) │     │  (voters table) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **অ্যাডমিন PDF আপলোড করবে**
2. **PDF কে Base64 এ কনভার্ট করে Gemini AI তে পাঠানো হবে**
3. **Gemini AI ভোটার তালিকা থেকে ডাটা এক্সট্র্যাক্ট করবে**
4. **অটো ডাটাবেসে ভোটার যোগ হবে**

---

## নতুন ফিচার

### 1. PDF আপলোড অপশন
- DataUploadCard এ নতুন "PDF (AI)" ট্যাব যোগ হবে
- PDF ফাইল সিলেক্ট করার সুবিধা

### 2. AI Data Extraction
- Gemini AI ব্যবহার করে PDF থেকে ভোটার তথ্য বের করা
- বাংলা ডিজিট এবং টেক্সট সাপোর্ট

### 3. Preview & Confirm
- AI যা এক্সট্র্যাক্ট করেছে তা দেখানো হবে
- কনফার্ম করলে ডাটাবেসে যোগ হবে

---

## Implementation Steps

### Step 1: Lovable Cloud Enable করতে হবে
Edge Function চালাতে Lovable Cloud প্রয়োজন।

### Step 2: Edge Function তৈরি
`supabase/functions/extract-voters-from-pdf/index.ts`:
- PDF (base64) receive করবে
- Lovable AI Gateway কল করবে
- Gemini Vision ব্যবহার করে ডাটা এক্সট্র্যাক্ট করবে
- JSON ফরম্যাটে ভোটার তালিকা রিটার্ন করবে

### Step 3: DataUploadCard আপডেট
নতুন PDF ট্যাব যোগ:
- PDF ফাইল আপলোড
- "AI দিয়ে এক্সট্র্যাক্ট করুন" বাটন
- এক্সট্র্যাক্টেড ডাটা প্রিভিউ
- কনফার্ম করলে ডাটাবেসে সেভ

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/extract-voters-from-pdf/index.ts` | Create | Gemini AI Edge Function |
| `supabase/config.toml` | Modify | Function config যোগ |
| `src/components/DataUploadCard.tsx` | Modify | PDF upload tab যোগ |

---

## Edge Function Code Overview

```typescript
// Gemini AI কে PDF পাঠানো হবে এভাবে:
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "এই ভোটার তালিকা থেকে সব ভোটারের তথ্য JSON ফরম্যাটে বের করো..."
          },
          {
            type: "image_url",
            image_url: { url: `data:application/pdf;base64,${pdfBase64}` }
          }
        ]
      }
    ]
  })
});
```

---

## UI Preview

```text
┌──────────────────────────────────────────────────┐
│  ডাটা আপলোড                                      │
├──────────────────────────────────────────────────┤
│  [ফাইল আপলোড] [টেক্সট ইনপুট] [PDF (AI) ✨]       │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  📄  PDF আপলোড করুন                        │  │
│  │  ভোটার তালিকার PDF দিন, AI অটো            │  │
│  │  ডাটা বের করবে                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [🔍 AI দিয়ে এক্সট্র্যাক্ট করুন]                  │
│                                                  │
│  ────────────────────────────────────────────    │
│  প্রিভিউ: ১২টি ভোটার পাওয়া গেছে                  │
│  ┌────────────────────────────────────────────┐  │
│  │ ক্রম │ নাম         │ ভোটার নং    │ জন্ম    │  │
│  │  ১  │ মোঃ করিম    │ 123456789  │ 1990   │  │
│  │  ২  │ মোঃ রহিম    │ 987654321  │ 1985   │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [✓ ডাটাবেসে যোগ করুন]                          │
└──────────────────────────────────────────────────┘
```

---

## সুবিধা

1. **সময় বাঁচবে**: ম্যানুয়ালি CSV বানাতে হবে না
2. **সহজ**: শুধু PDF আপলোড করো, বাকি AI করবে
3. **বাংলা সাপোর্ট**: বাংলা নাম, ঠিকানা সব ঠিকমতো এক্সট্র্যাক্ট হবে
4. **প্রিভিউ**: ডাটা সেভ করার আগে দেখে নিতে পারবে
5. **ফ্রি API**: তোমার আলাদা Gemini key লাগবে না

---

## প্রয়োজনীয় পদক্ষেপ

এই ফিচার ইমপ্লিমেন্ট করতে **Lovable Cloud enable** করতে হবে। Cloud enable করলে:
- Edge Function চালানো যাবে
- Lovable AI (Gemini) ব্যবহার করা যাবে
- কোনো API key দেওয়ার দরকার নেই

---

## Technical Details

### Gemini Prompt
```text
তুমি একজন ভোটার তালিকা ডাটা এক্সট্র্যাক্টর। এই PDF থেকে সব ভোটারের তথ্য বের করো।

প্রতিটি ভোটারের জন্য এই ফিল্ডগুলো বের করো:
- sl: ক্রমিক নম্বর (integer)
- voter_no: ভোটার নম্বর (string)
- name_bn: নাম বাংলায় (string)
- father_husband: পিতা/স্বামীর নাম (string)
- dob: জন্ম তারিখ (string)
- address: ঠিকানা (string)

শুধুমাত্র JSON array রিটার্ন করো, অন্য কিছু না।
```

### Error Handling
- PDF পড়তে না পারলে error message
- AI response parse করতে না পারলে retry option
- Rate limit হলে proper message দেখানো
