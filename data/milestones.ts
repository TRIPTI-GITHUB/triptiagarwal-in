import type { JourneyEra, Milestone } from "@/types/milestone";

export const milestones: Milestone[] = [
  {
    id: "2013-first-post",
    dateLabel: "2013",
    sortDate: "2013-01-01",
    title: "Where It All Began",
    shortDescription:
      "A first Facebook post about a growing coin collection, a first coin album, and a first swap on Numista — small steps that marked the start of a hobby that would eventually reach classrooms and national exhibitions.",
    categories: ["community"],
  },
  {
    id: "2014-15-basics",
    dateLabel: "2014–2015",
    sortDate: "2014-01-01",
    title: "Building the Basics",
    shortDescription:
      "The collection took its first serious shape with a proof coin set, followed by the opening of a dedicated Philately account at Delhi GPO — the beginning of a more structured approach to collecting.",
    categories: ["community"],
  },
  {
    id: "2016-order",
    dateLabel: "2016",
    sortDate: "2016-01-01",
    title: "Finding Order in the Collection",
    shortDescription:
      "As the collection grew, so did the need to organise it. This year was spent building proper albums and exploring thematic collecting — grouping pieces by story rather than simply by type.",
    categories: ["community"],
  },
  {
    id: "2017-18-widening",
    dateLabel: "2017–2018",
    sortDate: "2017-01-01",
    title: "Widening the Circle",
    shortDescription:
      "The hobby expanded outward: collecting US state quarters, joining the Delhi Coin Society, and — in a first step toward the digital heritage work of today — building a personal website, Tgnumista.in, to document the collection online.",
    categories: ["publication", "community"],
  },
  {
    id: "2019-public-stage",
    dateLabel: "2019",
    sortDate: "2019-01-01",
    title: "The First Public Stage",
    shortDescription:
      "A turning point. Tripti connected with the Numismatics Academy as an Associate Partner, created a personalised album marking 150 years of Mahatma Gandhi, hosted her first stall at a residential society in Gurgaon, and delivered her first-ever live session at a Delhi exhibition — stepping, for the first time, from collector to educator.",
    categories: ["talk", "community", "exhibition"],
  },
  {
    id: "2020-teaching-screen",
    dateLabel: "2020",
    sortDate: "2020-01-01",
    title: "Teaching Through a Screen",
    shortDescription:
      "A school exhibit and a series of live sessions with the Numismatics Academy marked her first steps into education. She also created a Gandhi Jayanti wall-display video and a Children's Day box display — creative formats for sharing history with younger audiences.",
    categories: ["exhibition", "talk", "workshop"],
  },
  {
    id: "2021-virtual",
    dateLabel: "2021",
    sortDate: "2021-01-01",
    title: "Going Virtual, Going Further",
    shortDescription:
      "Tripti built a 3D virtual exhibition on Gandhi Jayanti, which was featured in a newspaper. She also produced educational videos for Republic Day and Yoga Day, and took part in a virtual visit to Satyagraha House in South Africa — connecting Indian history to its global echoes.",
    categories: ["exhibition", "media", "publication"],
  },
  {
    id: "2022-year-of-firsts",
    dateLabel: "2022",
    sortDate: "2022-01-01",
    title: "A Year of Firsts",
    shortDescription:
      "This year brought a run of milestones: a stall at Vasantotsav, Raj Bhavan Dehradun; exhibits marking Azadi Ka Amrit Mahotsav; a turn as Master of Ceremony at Delhi Mudra Utsav; her first-ever Postcrossing meetup in Dehradun; and an exhibit at Dehradun GPO's Postal Week celebrations.",
    categories: ["exhibition", "talk", "community"],
  },
  {
    id: "2023-01-panchtantra",
    dateLabel: "January 2023",
    sortDate: "2023-01-01",
    title: "A Story Told in Coins",
    shortDescription:
      'Tripti presented "Four Panchtantra Stories through Colored Souvenir Coins" at Delhi Mudra Utsav — and received a surprise birthday e-postcard from the Hon\'ble Prime Minister of India.',
    categories: ["talk", "award"],
  },
  {
    id: "2023-02-amritpex",
    dateLabel: "February 2023",
    sortDate: "2023-02-01",
    title: "Third Prize, National Stage",
    shortDescription:
      "Tripti won 3rd Prize at Amritpex 2023, a National Level Philately Exhibition, in the AKAM category, for her exhibit on the story of India's freedom struggle. She was also felicitated by the Numisphila Club of Delhi.",
    categories: ["award", "exhibition"],
    featured: true,
    coverImageUrl: "/images/journey/amritpex-2023-award.jpg",
  },
  {
    id: "2023-03-new-venues",
    dateLabel: "March 2023",
    sortDate: "2023-03-01",
    title: "Reaching New Venues",
    shortDescription:
      "Exhibits followed at Vasantotsav and at the Army Postal Service in Roorkee — carrying her work to new audiences and institutions.",
    categories: ["exhibition"],
  },
  {
    id: "2023-09-postcrossing-society",
    dateLabel: "September–October 2023",
    sortDate: "2023-09-01",
    title: "Joining a Global Community",
    shortDescription:
      "Tripti became a lifetime member of the Postcrossing Society of India, and celebrated World Postcard Day at Dehradun GPO with the release of a private postcard and a hands-on workshop.",
    categories: ["community", "workshop"],
  },
  {
    id: "2023-12-armed-forces",
    dateLabel: "December 2023",
    sortDate: "2023-12-01",
    title: "Honouring the Armed Forces",
    shortDescription:
      "An exhibit on the Indian Armed Forces was showcased at the Military Literature Festival in Chandigarh.",
    categories: ["exhibition"],
  },
  {
    id: "2024-01-jury",
    dateLabel: "January–February 2024",
    sortDate: "2024-01-01",
    title: "A Voice in the Community",
    shortDescription:
      "An exhibit on Lord Ram and the Ramayana was shown at Dehradun GPO. Tripti also shared her perspective on the future of Indian philately, and served as a Jury Member for an India Post scholarship scheme — a first step into shaping opportunities for others.",
    categories: ["exhibition", "talk", "jury"],
    featured: true,
  },
  {
    id: "2024-03-three-stories",
    dateLabel: "March 2024",
    sortDate: "2024-03-01",
    title: "Three Stories, One Season",
    shortDescription:
      "Exhibits on Floral Melodies, the Ramayana, and the Indian Armed Forces were shown at Vasantotsav.",
    categories: ["exhibition"],
  },
  {
    id: "2024-05-stampex",
    dateLabel: "May 2024",
    sortDate: "2024-05-01",
    title: "International Recognition",
    shortDescription:
      "At Virtual Stampex International in London, Tripti's Floral Melodies exhibit won the People's Choice Award — and she also won the event's Bug Hunt Quiz.",
    categories: ["award", "exhibition"],
    featured: true,
  },
  {
    id: "2024-08-classroom",
    dateLabel: "August–September 2024",
    sortDate: "2024-08-01",
    title: "Into the Classroom",
    shortDescription:
      "Interactive sessions were held at Green Lawn Academy, Him Jyoti School, and a leading corporate bank — bringing philately and postcrossing to students and adult learners alike. Tripti also received the Official Postcrossing Ambassador Badge.",
    categories: ["talk", "workshop", "award"],
  },
  {
    id: "2024-10-national-television",
    dateLabel: "October 2024",
    sortDate: "2024-10-01",
    title: "On National Television",
    shortDescription:
      "The Wildlife Week Philately Exhibition, hosted at the Art Gallery, Dehradun, with a closing ceremony at Raj Bhawan, was aired on Akashwani Dehradun and covered by Times of India, DD Uttarakhand, and News18. A district-level exhibition followed in the Invitee category.",
    categories: ["exhibition", "media"],
    featured: true,
  },
  {
    id: "2025-01-new-additions",
    dateLabel: "January–March 2025",
    sortDate: "2025-01-01",
    title: "New Additions, New Themes",
    shortDescription:
      'A Shri Ram Janmabhoomi silver coin joined the collection. Exhibits followed at Vasant Utsav and at Virtual Stampex London, under the theme "Guardians of the Tricolor."',
    categories: ["exhibition"],
  },
  {
    id: "2025-07-twenty-years",
    dateLabel: "July 2025",
    sortDate: "2025-07-01",
    title: "Twenty Years of Postcrossing",
    shortDescription:
      "Tripti marked 20 years of the global Postcrossing movement with a meetup and philately workshop at Kala Kendra, Dehradun.",
    categories: ["community", "workshop"],
  },
  {
    id: "2025-10-next-generation",
    dateLabel: "October 2025",
    sortDate: "2025-10-01",
    title: "Postcards for the Next Generation",
    shortDescription:
      "World Postcard Day was celebrated at Kala Kendra, alongside a kids-friendly philately and postcard-writing activity for students of Punnya Experiential Learning School, Dehradun.",
    categories: ["workshop"],
  },
  {
    id: "2025-11-legacy",
    dateLabel: "November 2025",
    sortDate: "2025-11-01",
    title: "Honouring a Legacy",
    shortDescription:
      "A proof coin set and stamp marking the 150th birth anniversary of Sardar Vallabhbhai Patel were added to the collection, alongside exhibits for Children's Day and Constitution Day.",
    categories: ["exhibition"],
  },
];

export const journeyEras: JourneyEra[] = [
  {
    id: "foundations",
    label: "Foundations",
    yearRange: "2013 – 2019",
    intro:
      "Every collection starts with a single piece. For Tripti, it started with a coin — and a Facebook post announcing it to the world. The years that followed were about learning the craft: building albums, opening a philately account, and slowly turning a private hobby into a shared pursuit.",
    milestoneIds: [
      "2013-first-post",
      "2014-15-basics",
      "2016-order",
      "2017-18-widening",
      "2019-public-stage",
    ],
  },
  {
    id: "momentum",
    label: "Building Momentum",
    yearRange: "2020 – 2022",
    intro:
      "These were the years the hobby became a practice. Between a global shift to virtual spaces and a return to in-person exhibitions, Tripti found new ways to share what she'd learned — through video, through schools, and through the community she was beginning to build.",
    milestoneIds: ["2020-teaching-screen", "2021-virtual", "2022-year-of-firsts"],
  },
  {
    id: "national-recognition",
    label: "National Recognition",
    yearRange: "2023",
    intro:
      "2023 was the year the wider philatelic and numismatic community began to take notice — with an award, a felicitation, and even a personal greeting from the Prime Minister's office.",
    milestoneIds: [
      "2023-01-panchtantra",
      "2023-02-amritpex",
      "2023-03-new-venues",
      "2023-09-postcrossing-society",
      "2023-12-armed-forces",
    ],
  },
  {
    id: "going-global",
    label: "Going Wider, Going Global",
    yearRange: "2024",
    intro:
      "In 2024, the work stepped onto an international stage — and, for the first time, into a formal role shaping how the next generation of philatelists would be recognised.",
    milestoneIds: [
      "2024-01-jury",
      "2024-03-three-stories",
      "2024-05-stampex",
      "2024-08-classroom",
      "2024-10-national-television",
    ],
  },
  {
    id: "continues",
    label: "The Journey Continues",
    yearRange: "2025",
    intro:
      "The story is still being written. 2025 has already brought new acquisitions, new exhibits, and a milestone anniversary in the postcrossing community Tripti helped grow.",
    milestoneIds: ["2025-01-new-additions", "2025-07-twenty-years", "2025-10-next-generation", "2025-11-legacy"],
  },
];

export const featuredInstitutions = [
  "Green Lawn Academy",
  "Him Jyoti School",
  "Punnya Experiential Learning School, Dehradun",
  "A leading corporate bank (adult learners)",
];

export const mediaFeatures = [
  "Akashwani Dehradun",
  "Times of India",
  "DD Uttarakhand",
  "News18",
];

export const awardHighlights = [
  {
    title: "3rd Prize — Amritpex 2023",
    detail: "National Level Philately Exhibition, AKAM category. February 2023.",
  },
  {
    title: "People's Choice Award",
    detail: "Floral Melodies exhibit, Virtual Stampex International, London. May 2024.",
  },
  {
    title: "Official Postcrossing Ambassador",
    detail: "Badge awarded by Postcrossing since September 2024.",
  },
];
