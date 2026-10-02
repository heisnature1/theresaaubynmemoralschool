import { GalleryItem, HistoryMilestone } from '@/types/school';

export const SCHOOL_HISTORY_MILESTONES: HistoryMilestone[] = [
  {
    year: '1988',
    eraTitle: 'The Founding Vision',
    headline: 'Establishment in Honor of Madam Teresa Aubyn',
    description:
      'Founded on October 2, 1988, with 42 pioneer pupils and 4 dedicated educators to honor the enduring legacy of Late Madam Teresa Aubyn—a lifelong champion of literacy, moral discipline, and community upliftment.',
    highlightMetric: '42 Pioneer Pupils',
    iconName: 'Landmark',
  },
  {
    year: '1996',
    eraTitle: 'Primary & Junior High Expansion',
    headline: 'Commissioning of the Emerald Heritage Block',
    description:
      'Expanded from Early Childhood and Primary education to a full Junior High School (JHS 1–3) stream. Our inaugural BECE graduating cohort achieved a 100% pass rate with 84% distinctions.',
    highlightMetric: '100% BECE Pass Rate',
    iconName: 'Award',
  },
  {
    year: '2008',
    eraTitle: 'Twentieth Anniversary & STEM Era',
    headline: 'Golden Jubilee Library & Modern STEM Complex',
    description:
      'Unveiled the Teresa Aubyn Science, Robotics & ICT Laboratory alongside a 12,000-volume library, integrating hands-on digital literacy and scientific inquiry across Basic 1 through JHS 3.',
    highlightMetric: '3 Modern Labs',
    iconName: 'Cpu',
  },
  {
    year: '2017',
    eraTitle: 'Holistic Welfare & Academic Mastery',
    headline: 'School Nutrition Program & Structured Extra Classes',
    description:
      'Launched our signature Daily School Feeding & Balanced Nutrition Program paired with structured afternoon Extra Classes, boosting student retention, afternoon focus, and national exam scores.',
    highlightMetric: '98.6% Daily Attendance',
    iconName: 'Utensils',
  },
  {
    year: '2026',
    eraTitle: 'Records Modernisation',
    headline: 'Central Bursary, Feeding & Report Records Office',
    description:
      'Brought class fee books, the daily feeding register, continuous assessment marks and terminal report cards together in one office system shared by the bursary, the headmaster and every class teacher.',
    highlightMetric: 'Reports Ready in Minutes',
    iconName: 'Sparkles',
  },
];

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'St. Teresa Main Academic Quadrangle',
    category: 'Campus & Heritage',
    imageUrl: '/images/campus-hero.jpg',
    caption:
      'Our flagship three-story Emerald & Gold Academic Wing surrounded by manicured tropical gardens during morning assembly.',
    dateLabel: 'October 2026',
    featured: true,
  },
  {
    id: 'gal-2',
    title: 'STEM, Robotics & Computing Laboratory',
    category: 'STEM & Academics',
    imageUrl: '/images/stem-lab.jpg',
    caption:
      'Upper Primary and JHS scholars conducting collaborative experiments in microscope analysis, coding, and electronics.',
    dateLabel: 'September 2026',
    featured: true,
  },
  {
    id: 'gal-3',
    title: 'Annual Inter-House Sports & Cultural Festival',
    category: 'Sports & Culture',
    imageUrl: '/images/sports-culture.jpg',
    caption:
      'Students in St. Teresa green and gold house jerseys celebrating teamwork and athletic excellence at the Founder’s Shield Games.',
    dateLabel: 'August 2026',
    featured: true,
  },
  {
    id: 'gal-4',
    title: 'The Teresa Aubyn Memorial Library & Study Hall',
    category: 'STEM & Academics',
    imageUrl: '/images/library-dining.jpg',
    caption:
      'A serene reading sanctuary stocked with literature, reference encyclopedias, and digital research stations for every grade level.',
    dateLabel: 'September 2026',
  },
  {
    id: 'gal-5',
    title: 'Founder’s Memorial Heritage Courtyard',
    category: 'Campus & Heritage',
    imageUrl: '/images/heritage-courtyard.jpg',
    caption:
      'The commemorative bronze plaque and tranquil courtyard honoring the vision and values of Late Madam Teresa Aubyn.',
    dateLabel: 'October 2026',
  },
  {
    id: 'gal-6',
    title: 'Daily School Nutrition & Dining Commons',
    category: 'Student Life & Dining',
    imageUrl: '/images/dining-hall.jpg',
    caption:
      'Hygienic, sunlit dining commons where freshly prepared, balanced meals are served daily under our tracked Feeding Program.',
    dateLabel: 'October 2026',
  },
];

export interface SchoolNotice {
  id: string;
  date: string;
  title: string;
  body: string;
  tag: 'Term' | 'Examinations' | 'Feeding' | 'Event' | 'Notice';
}

export const SCHOOL_NOTICES: SchoolNotice[] = [
  {
    id: 'notice-1',
    date: '2 October 2026',
    title: 'End-of-semester examinations begin 9 November',
    body:
      'Continuous assessment marks must be submitted through the teacher portal by Friday 30 October. Timetables for KG 2 through JHS 3 are available from the class teachers.',
    tag: 'Examinations',
  },
  {
    id: 'notice-2',
    date: '28 September 2026',
    title: 'First semester fee instalments now due',
    body:
      'The second tuition instalment falls due on 15 October. Parents may settle at the Bursary between 7:00 a.m. and 5:00 p.m., or by mobile money to the school merchant number.',
    tag: 'Notice',
  },
  {
    id: 'notice-3',
    date: '24 September 2026',
    title: "Founder's Day and inter-house sports — 2 October",
    body:
      "We mark the thirty-eighth anniversary of the school with a thanksgiving service, the Founder's Shield athletics finals and a durbar on the upper field. Parents are warmly welcome.",
    tag: 'Event',
  },
  {
    id: 'notice-4',
    date: '18 September 2026',
    title: 'New feeding payment cards issued to KG and Lower Primary',
    body:
      'Parents who prefer the prepaid plan will now receive a meal card per pupil. Daily cash collection continues as before for families who prefer to pay per meal.',
    tag: 'Feeding',
  },
];

export const TERM_DATES: Array<{ label: string; detail: string }> = [
  { label: 'First semester', detail: '14 September 2026 – 18 December 2026' },
  { label: 'Mid-semester break', detail: '26 October – 30 October 2026' },
  { label: 'End-of-semester examinations', detail: '9 – 20 November 2026' },
  { label: 'Report cards issued', detail: '11 December 2026' },
  { label: 'Second semester resumes', detail: '12 January 2027' },
];

export const SCHOOL_VALUES: Array<{ title: string; body: string }> = [
  {
    title: 'Diligence',
    body:
      'Steady, unhurried work each day. Pupils are taught to finish what they begin and to value effort over easy praise.',
  },
  {
    title: 'Integrity',
    body:
      'Honesty in the classroom, on the field and in the way the school keeps its own accounts with parents.',
  },
  {
    title: 'Service',
    body:
      'A long habit of looking after one another — from the KG reading buddies programme to the JHS community service week.',
  },
  {
    title: 'Stewardship',
    body:
      'Care for our compound, our library and our memorial courtyard, so that those who come after us inherit them well kept.',
  },
];

export const ADMISSION_STEPS: Array<{ step: string; title: string; body: string }> = [
  {
    step: '01',
    title: 'Visit the school',
    body:
      'Tours run on Tuesdays and Thursdays between 9:00 a.m. and 12:00 noon. Walk in, or telephone the office to agree a time.',
  },
  {
    step: '02',
    title: 'Submit the application',
    body:
      "Bring the completed application form with the pupil's birth certificate, immunisation card and two passport photographs, or send them through the office.",
  },
  {
    step: '03',
    title: 'Assessment and interview',
    body:
      'Basic 2 and above sit a short literacy and numeracy assessment. KG and Basic 1 applicants meet the class teacher with their parents.',
  },
  {
    step: '04',
    title: 'Offer and registration',
    body:
      'Successful families receive an offer letter within five working days, together with the fee schedule for the term and the feeding options.',
  },
];

export const ACADEMIC_DEPARTMENTS: Array<{
  name: string;
  classes: string;
  subjects: string[];
  note: string;
}> = [
  {
    name: 'Early Childhood',
    classes: 'KG 1 – KG 2',
    subjects: ['Language & Literacy', 'Number Work', 'Creative Arts', 'Rhymes and Movement'],
    note:
      'Small groups, a reading corner in every room, and a rest period after the midday meal.',
  },
  {
    name: 'Lower Primary',
    classes: 'Basic 1 – Basic 3',
    subjects: ['English Language', 'Mathematics', 'Integrated Science', 'Ghanaian Language'],
    note:
      'Phonics and handwriting are taught daily; reading age is assessed each term.',
  },
  {
    name: 'Upper Primary',
    classes: 'Basic 4 – Basic 6',
    subjects: ['English Language', 'Mathematics', 'Science', 'Social Studies', 'ICT'],
    note:
      'Basic 6 prepares for the Junior High entrance assessment with weekly timed practice papers.',
  },
  {
    name: 'Junior High',
    classes: 'JHS 1 – JHS 3',
    subjects: ['Mathematics', 'English', 'Integrated Science', 'Social Studies', 'Computing'],
    note:
      'BECE preparation throughout, with afternoon extra classes and Saturday mock examinations.',
  },
];

export const DEPARTMENT_SUBJECTS_FULL = [
  'Mathematics',
  'English Language',
  'Integrated Science',
  'Social Studies',
  'Computing & ICT',
  'Religious & Moral Education',
  'Creative Arts & Design',
  'French & Ghanaian Language',
];

export const OFFICE_CONTACTS = {
  mainPhone: '+233 24 410 0888',
  headmasterPhone: '+233 24 855 1920',
  bursaryPhone: '+233 54 321 9087',
  generalEmail: 'info@stteresa-aubyn.edu.gh',
  headmasterEmail: 'headmaster@stteresa-aubyn.edu.gh',
  ownerEmail: 'owner@stteresa-aubyn.edu.gh',
  postalAddress: 'P.O. Box TA 188, No. 18 Teresa Aubyn Heritage Avenue, Ghana',
  digitalAddress: 'CC-018-1988',
};
