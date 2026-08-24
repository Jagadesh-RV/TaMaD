import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import toast from 'react-hot-toast';
import api from '../utils/api';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address'),
  country: z.string().length(2),
  phone: z.string().trim().min(1, 'Enter your phone number'),
  subject: z.string().trim().min(3, 'Enter a subject').max(120, 'Subject is too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
});

type ContactFormValues = z.infer<typeof formSchema>;
type Country = CountryCode;

const flagFor = (country: Country) => country.replace(/./g, (letter) => String.fromCodePoint(letter.charCodeAt(0) + 127397));

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const countries = useMemo(() => {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return getCountries().map((country) => ({
      code: country,
      name: displayNames.of(country) || country,
      dialCode: `+${getCountryCallingCode(country)}`,
    })).sort((left, right) => left.name.localeCompare(right.name));
  }, []);
  const { register, handleSubmit, setError, clearErrors, reset, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema as any) as any,
    defaultValues: { country: 'US' },
  });

  const onSubmit = async (values: ContactFormValues) => {
    const country = values.country as Country;
    if (!isValidPhoneNumber(values.phone, country)) {
      setError('phone', { type: 'validate', message: 'Enter a valid phone number for the selected country' });
      return;
    }
    const parsedPhone = parsePhoneNumberFromString(values.phone, country);
    if (!parsedPhone?.isValid()) {
      setError('phone', { type: 'validate', message: 'Enter a valid phone number for the selected country' });
      return;
    }

    try {
      await api.post('/contact', {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        country,
        phoneNumber: parsedPhone.number,
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      setIsSubmitted(true);
      reset({ country: values.country });
      toast.success('Your message has been sent.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Unable to send your message. Please try again.');
    }
  };

  if (isSubmitted) {
    return <div className="page"><div className="contact-success card"><div className="contact-success-icon"><Mail size={28} /></div><h1 className="page-title">Message sent</h1><p className="contact-muted">Thanks for reaching out. Our team will get back to you shortly.</p><button type="button" className="btn btn-primary contact-success-button" onClick={() => setIsSubmitted(false)}>Send another message</button></div></div>;
  }

  return <div className="page"><div className="contact-header"><p className="contact-eyebrow">We’re here to help</p><h1 className="page-title">Contact Us</h1><p className="contact-muted">Tell us what you need and we’ll get back to you as soon as possible.</p></div><div className="contact-layout"><aside className="contact-details card"><h2 className="contact-section-title">Get in touch</h2><p className="contact-muted">Whether you have a question, feedback, or need help with TaMaD, our team is ready to help.</p><div className="contact-detail-item"><Mail size={18} /><div><strong>Email</strong><span>support@tamad.app</span></div></div><div className="contact-detail-item"><Phone size={18} /><div><strong>Phone</strong><span>Mon–Fri, 9:00–18:00 UTC</span></div></div><div className="contact-detail-item"><MapPin size={18} /><div><strong>Response time</strong><span>Usually within one business day</span></div></div></aside><form className="contact-form card" onSubmit={handleSubmit(onSubmit)} noValidate><div className="contact-form-grid"><div className="contact-field"><label htmlFor="contact-name">Full name</label><input id="contact-name" {...register('name', { onChange: () => clearErrors('name') })} className="input-field" autoComplete="name" />{errors.name && <p className="contact-error" role="alert">{errors.name.message}</p>}</div><div className="contact-field"><label htmlFor="contact-email">Email</label><input id="contact-email" {...register('email', { onChange: () => clearErrors('email') })} type="email" className="input-field" autoComplete="email" />{errors.email && <p className="contact-error" role="alert">{errors.email.message}</p>}</div></div><div className="contact-field"><label htmlFor="contact-country">Country</label><select id="contact-country" {...register('country', { onChange: () => clearErrors('phone') })} className="input-field contact-country-select" aria-describedby="contact-country-help">{countries.map((country) => <option key={country.code} value={country.code}>{flagFor(country.code)} {country.name} ({country.dialCode})</option>)}</select><span id="contact-country-help" className="contact-help">Select your country so we can validate and format your number correctly.</span></div><div className="contact-field"><label htmlFor="contact-phone">Phone number</label><input id="contact-phone" {...register('phone', { onChange: (event) => { event.target.value = event.target.value.replace(/[^\d\s().-]/g, ''); clearErrors('phone'); } })} type="tel" className="input-field" autoComplete="tel" inputMode="tel" />{errors.phone && <p className="contact-error" role="alert">{errors.phone.message}</p>}</div><div className="contact-field"><label htmlFor="contact-subject">Subject</label><input id="contact-subject" {...register('subject', { onChange: () => clearErrors('subject') })} className="input-field" />{errors.subject && <p className="contact-error" role="alert">{errors.subject.message}</p>}</div><div className="contact-field"><label htmlFor="contact-message">Message</label><textarea id="contact-message" {...register('message', { onChange: () => clearErrors('message') })} className="input-field contact-message" rows={6} />{errors.message && <p className="contact-error" role="alert">{errors.message.message}</p>}</div><button type="submit" disabled={isSubmitting} className="btn btn-primary contact-submit">{isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Send message'}</button></form></div></div>;
}
