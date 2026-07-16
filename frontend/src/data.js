export const HCP_LIST = [
  { id: '1', name: 'Dr. Sarah Chen', hospital: 'Mass General Hospital', specialty: 'Cardiology', avatarColor: 'bg-primary-600', initials: 'SC' },
  { id: '2', name: 'Dr. Michael Rodriguez', hospital: 'Johns Hopkins Medical', specialty: 'Oncology', avatarColor: 'bg-teal-600', initials: 'MR' },
  { id: '3', name: 'Dr. Emily Watson', hospital: 'Cleveland Clinic', specialty: 'Neurology', avatarColor: 'bg-amber-600', initials: 'EW' },
  { id: '4', name: 'Dr. James Park', hospital: 'Mayo Clinic', specialty: 'Endocrinology', avatarColor: 'bg-rose-600', initials: 'JP' },
  { id: '5', name: 'Dr. Olivia Brennan', hospital: 'Stanford Health Care', specialty: 'Pediatrics', avatarColor: 'bg-indigo-600', initials: 'OB' },
  { id: '6', name: 'Dr. David Kim', hospital: 'UCSF Medical Center', specialty: 'Psychiatry', avatarColor: 'bg-emerald-600', initials: 'DK' },
];

export const RECENT_INTERACTIONS = [
  {
    id: 'r1', hcpId: '1', hcpName: 'Dr. Sarah Chen', type: 'In-Person Visit', date: '2026-07-11',
    time: '10:30', attendees: ['Dr. Sarah Chen', 'Rep: You'],
    topics: ['Lipitor efficacy data', 'Patient adherence rates'],
    materials: ['Clinical reprint 2026', 'Product brochure'],
    samples: ['CardioMed 20mg x5'],
    sentiment: 'Positive', outcomes: 'Interested in reviewing full trial data. Requested follow-up with detailed efficacy comparison.',
    followUp: 'Send efficacy comparison report', followUpDate: '2026-07-18',
  },
  {
    id: 'r2', hcpId: '1', hcpName: 'Dr. Sarah Chen', type: 'Virtual Meeting', date: '2026-06-28',
    time: '14:00', attendees: ['Dr. Sarah Chen', 'Nurse Coordinator', 'Rep: You'],
    topics: ['New formulation launch', 'Dosing protocol'],
    materials: ['Dosing guide', 'Webinar recording'],
    samples: [],
    sentiment: 'Neutral', outcomes: 'Acknowledged new formulation. Needs time to review protocol before deciding.',
    followUp: 'Schedule in-person demo', followUpDate: '2026-07-10',
  },
  {
    id: 'r3', hcpId: '2', hcpName: 'Dr. Michael Rodriguez', type: 'In-Person Visit', date: '2026-07-09',
    time: '09:15', attendees: ['Dr. Michael Rodriguez', 'Rep: You'],
    topics: ['OncoCare trial results', 'Combination therapy options'],
    materials: ['Phase III data summary'],
    samples: ['OncoCare 50mg x3'],
    sentiment: 'Skeptical', outcomes: 'Questioned sample size of trial. Wants peer-reviewed publication before considering.',
    followUp: 'Share peer-reviewed publication', followUpDate: '2026-07-20',
  },
];

export const AI_WORKFLOW_STEPS = [
  { label: 'Intent detected', detail: 'Log HCP interaction' },
  { label: 'Tool selected', detail: 'interaction_logger' },
  { label: 'Extracting entities', detail: 'Parsing HCP, topics, samples' },
  { label: 'Auto-filling form', detail: 'Mapping to schema fields' },
];

export const EMPTY_FORM = {
  hcpName: '', hospital: '', specialty: '', interactionType: '', date: '', time: '',
  attendees: '', topics: '', materials: '', samples: '', sentiment: '', outcomes: '',
  followUp: '', followUpDate: '',
};

const SAMPLE_REPLIES = {
  'log today\'s visit': {
    reply: "I've logged your visit today with Dr. Sarah Chen at Mass General Hospital. Here's what I captured — please review the auto-filled form on the right and adjust anything before saving.",
    formData: {
      hcpName: 'Dr. Sarah Chen', hospital: 'Mass General Hospital', specialty: 'Cardiology',
      interactionType: 'In-Person Visit', date: '2026-07-14', time: '10:30',
      attendees: 'Dr. Sarah Chen, Rep: You',
      topics: 'Lipitor efficacy data, Patient adherence rates',
      materials: 'Clinical reprint 2026, Product brochure',
      samples: 'CardioMed 20mg x5',
      sentiment: 'Positive',
      outcomes: 'Interested in reviewing full trial data. Requested follow-up with detailed efficacy comparison.',
      followUp: 'Send efficacy comparison report', followUpDate: '2026-07-21',
    },
  },
  "show dr. sarah's history": {
    reply: "Dr. Sarah Chen has 2 recent interactions on record. Her most recent visit (Jul 11) was positive — she's interested in Lipitor efficacy data and requested a follow-up. I've pre-filled the form with her latest interaction context for continuity.",
    formData: {
      hcpName: 'Dr. Sarah Chen', hospital: 'Mass General Hospital', specialty: 'Cardiology',
      interactionType: 'In-Person Visit', date: '2026-07-14', time: '11:00',
      attendees: 'Dr. Sarah Chen, Rep: You',
      topics: 'Follow-up on Lipitor efficacy, Adherence discussion',
      sentiment: 'Positive',
    },
  },
  'schedule follow-up': {
    reply: "I've prepared a follow-up interaction log for Dr. Sarah Chen based on her last visit. The form is pre-filled with the follow-up context from July 11th — she requested an efficacy comparison report.",
    formData: {
      hcpName: 'Dr. Sarah Chen', hospital: 'Mass General Hospital', specialty: 'Cardiology',
      interactionType: 'Virtual Meeting', date: '2026-07-21', time: '14:00',
      attendees: 'Dr. Sarah Chen, Rep: You',
      topics: 'Efficacy comparison report review',
      materials: 'Efficacy comparison report',
      sentiment: 'Positive',
      outcomes: 'Schedule video call to walk through efficacy data.',
      followUp: 'Confirm meeting and send calendar invite', followUpDate: '2026-07-21',
    },
  },
  'summarize last interaction': {
    reply: "Last interaction with Dr. Sarah Chen was on July 11 (In-Person Visit). She was positive about Lipitor efficacy data, requested a full trial comparison. 5 samples of CardioMed 20mg were distributed. Follow-up is due July 18. I've pre-filled the form with this summary context.",
    formData: {
      hcpName: 'Dr. Sarah Chen', hospital: 'Mass General Hospital', specialty: 'Cardiology',
      interactionType: 'In-Person Visit', date: '2026-07-11', time: '10:30',
      attendees: 'Dr. Sarah Chen, Rep: You',
      topics: 'Lipitor efficacy data, Patient adherence rates',
      materials: 'Clinical reprint 2026, Product brochure',
      samples: 'CardioMed 20mg x5',
      sentiment: 'Positive',
      outcomes: 'Interested in reviewing full trial data. Requested follow-up with detailed efficacy comparison.',
      followUp: 'Send efficacy comparison report', followUpDate: '2026-07-18',
    },
  },
};

export function getAIResponse(prompt) {
  const normalized = prompt.toLowerCase().trim();
  for (const [key, value] of Object.entries(SAMPLE_REPLIES)) {
    if (normalized.includes(key.replace(/^show |^schedule |^summarize |^log /, '').split("'")[0].split(' ')[0])) {
      return value;
    }
  }
  if (normalized.includes('sarah')) return SAMPLE_REPLIES["show dr. sarah's history"];
  if (normalized.includes('rodriguez') || normalized.includes('oncology')) {
    return {
      reply: "I've logged your visit with Dr. Michael Rodriguez at Johns Hopkins Medical. He was skeptical about the OncoCare trial results — I've noted that he wants peer-reviewed publication before proceeding.",
      formData: {
        hcpName: 'Dr. Michael Rodriguez', hospital: 'Johns Hopkins Medical', specialty: 'Oncology',
        interactionType: 'In-Person Visit', date: '2026-07-14', time: '09:00',
        attendees: 'Dr. Michael Rodriguez, Rep: You',
        topics: 'OncoCare trial results, Combination therapy options',
        materials: 'Phase III data summary',
        samples: 'OncoCare 50mg x3',
        sentiment: 'Skeptical',
        outcomes: 'Questioned sample size of trial. Wants peer-reviewed publication before considering.',
        followUp: 'Share peer-reviewed publication', followUpDate: '2026-07-20',
      },
    };
  }
  return {
    reply: "I've parsed your description and auto-filled the interaction form. Please review the fields on the right and make any adjustments before saving. If you mention a specific doctor or topic, I can provide more precise extraction.",
    formData: {
      interactionType: 'In-Person Visit', date: '2026-07-14', time: new Date().toTimeString().slice(0, 5),
      attendees: 'Rep: You', sentiment: 'Neutral',
    },
  };
}