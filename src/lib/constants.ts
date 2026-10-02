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
    eraTitle: 'Cloud Digital Transformation',
    headline: 'Unified Vercel & Supabase Smart Campus Portal',
    description:
      'Transitioned all institutional operations—class fee management, daily feeding collections, continuous assessment grading, teacher registrations, and terminal report generation—to a real-time cloud platform.',
    highlightMetric: '100% Paperless Reports',
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
