import { NextRequest, NextResponse } from 'next/server';
import { appendAuditLog, getSchoolState, saveSchoolState } from '@/lib/store';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ContactInquiry } from '@/types/school';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, subject, childClass, message } = body;

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Full name, email, and message are required.' },
        { status: 400 }
      );
    }

    const state = getSchoolState();
    const newInquiry: ContactInquiry = {
      id: `inq-${Date.now()}`,
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      phone: String(phone || 'Not provided').trim(),
      subject: String(subject || 'General Admissions & Campus Inquiry').trim(),
      childClass: childClass ? String(childClass).trim() : undefined,
      message: String(message).trim(),
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    state.contactInquiries.unshift(newInquiry);

    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.from('contact_inquiries').insert({
        full_name: newInquiry.fullName,
        email: newInquiry.email,
        phone: newInquiry.phone,
        subject: newInquiry.subject,
        child_class: newInquiry.childClass,
        message: newInquiry.message,
        status: 'unread',
      });
    }

    appendAuditLog(state, {
      actorName: newInquiry.fullName,
      actorRole: 'super_admin',
      action: 'New Public Contact Inquiry',
      category: 'system',
      details: `Inquiry received from ${newInquiry.fullName}: "${newInquiry.subject}".`,
    });

    saveSchoolState(state);
    return NextResponse.json({ ok: true, inquiry: newInquiry, state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { inquiryId, status } = body;

    const state = getSchoolState();
    const inq = state.contactInquiries.find((i) => i.id === inquiryId);
    if (!inq) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    inq.status = status || 'responded';
    saveSchoolState(state);
    return NextResponse.json({ ok: true, inquiry: inq, state });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}
