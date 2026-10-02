'use client';

import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { SCHOOL_CLASSES } from '@/lib/grading';

const TOPICS = [
  'Admissions and school visit',
  'Fees and meal plan',
  'Semester report or records',
  'General enquiry',
];

export function EnquiryForm({ phone: contactPhone }: { phone?: string | null }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(TOPICS[0]);
  const [childClass, setChildClass] = useState<string>('Basic 1');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) return;

    setSending(true);
    setError(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || 'Not provided',
          subject,
          childClass,
          message,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'The message could not be sent. Please telephone the office.');
        return;
      }

      setSent(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      setError('The message could not be sent. Please telephone the office.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-md border border-theresa-green-200 bg-theresa-green-50 p-8">
        <CheckCircle2 className="h-7 w-7 text-theresa-green-700" />
        <h3 className="mt-3 font-serif text-xl font-bold text-theresa-green-950">
          Your message has reached the school office
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          A member of the office staff will reply to you within two working days.
          {contactPhone ? (
            <>
              {' '}If the matter is urgent, please telephone{' '}
              <a
                href={`tel:${contactPhone.replace(/\s/g, '')}`}
                className="font-semibold text-theresa-green-800 hover:underline"
              >
                {contactPhone}
              </a>
              .
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 rounded-xl border border-theresa-green-800 px-4 py-2 text-sm font-semibold text-theresa-green-900 transition hover:bg-white magnetic-btn"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="enquiry-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Your name <span className="text-rose-600">*</span>
          </label>
          <input
            id="enquiry-name"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="e.g. Comfort Mensah"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          />
        </div>
        <div>
          <label htmlFor="enquiry-phone" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Telephone
          </label>
          <input
            id="enquiry-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+233 24 000 0000"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="enquiry-email" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Email address <span className="text-rose-600">*</span>
          </label>
          <input
            id="enquiry-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          />
        </div>
        <div>
          <label htmlFor="enquiry-class" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Class of interest
          </label>
          <select
            id="enquiry-class"
            value={childClass}
            onChange={(event) => setChildClass(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
          >
            {SCHOOL_CLASSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="enquiry-topic" className="mb-1.5 block text-sm font-semibold text-slate-800">
          What is your enquiry about?
        </label>
        <select
          id="enquiry-topic"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
        >
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="enquiry-message" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Message <span className="text-rose-600">*</span>
        </label>
        <textarea
          id="enquiry-message"
          rows={5}
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us about your child, or ask your question here."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-theresa-green-700 focus:ring-4 focus:ring-theresa-green-100/70"
        />
      </div>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-theresa-green-800 to-theresa-green-700 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:shadow-lift disabled:opacity-60 magnetic-btn shine"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending…' : 'Send to the school office'}
        </button>
        <p className="text-xs text-slate-500">
          Your message is read by the office staff and the Headmaster. We reply within two working
          days.
        </p>
      </div>
    </form>
  );
}
