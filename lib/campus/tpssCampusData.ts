export type CampusCategory = "Academic" | "Services" | "Parking" | "Campus Hub";

export type CampusLocation = {
  id: string;
  code: string;
  name: string;
  category: CampusCategory;
  description: string;
  details: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  routeNodeId: string;
};

export type CampusRouteNode = {
  id: string;
  x: number;
  y: number;
  label?: string;
};

export type CampusRouteEdge = {
  from: string;
  to: string;
  label?: string;
};

export const tpssCampusLocations: CampusLocation[] = [
  {
    id: "st",
    code: "ST",
    name: "Student Services Center",
    category: "Services",
    description: "Core student-facing services and the main arrival point from the bridge.",
    details: [
      "Financial Aid Office",
      "Public Safety Office",
      "Raptor Central",
      "Enrollment and Records services",
    ],
    x: 58.5,
    y: 39.8,
    width: 9.5,
    height: 12.5,
    routeNodeId: "st",
  },
  {
    id: "rc",
    code: "RC",
    name: "Resource Center",
    category: "Academic",
    description: "Academic support building with library resources nearby.",
    details: ["Library access", "Study support", "Academic resource services"],
    x: 70.5,
    y: 51.8,
    width: 11,
    height: 12,
    routeNodeId: "rc",
  },
  {
    id: "lb",
    code: "LB",
    name: "Catherine and Isiah Leggett Math and Science Building",
    category: "Academic",
    description: "Math and science classrooms, plus greenhouse and planetarium facilities.",
    details: ["Math and Science Building", "Greenhouse", "Planetarium"],
    x: 68,
    y: 68.5,
    width: 14,
    height: 14,
    routeNodeId: "lb",
  },
  {
    id: "sn",
    code: "SN",
    name: "Science North Building",
    category: "Academic",
    description: "Science North academic space near the central services corridor.",
    details: ["Academic classrooms", "Close to Student Services"],
    x: 61.5,
    y: 56.3,
    width: 5,
    height: 12,
    routeNodeId: "sn",
  },
  {
    id: "cm",
    code: "CM",
    name: "Charlene R. Nunley Student Services Center",
    category: "Services",
    description: "Student-focused services and shared campus support space.",
    details: ["Student services", "Campus support"],
    x: 83.8,
    y: 59.8,
    width: 8,
    height: 10.5,
    routeNodeId: "cm",
  },
  {
    id: "eg",
    code: "EG",
    name: "East Garage",
    category: "Parking",
    description: "Primary east-side parking structure across the rail line.",
    details: ["Garage parking", "Closest to east-side academic buildings"],
    x: 34.5,
    y: 12.8,
    width: 14.5,
    height: 11,
    routeNodeId: "eg",
  },
  {
    id: "wg",
    code: "WG",
    name: "West Garage",
    category: "Parking",
    description: "West-side parking garage adjacent to central academic buildings.",
    details: ["Garage parking", "Near CF and CU"],
    x: 20.3,
    y: 20.5,
    width: 8.8,
    height: 11,
    routeNodeId: "wg",
  },
  {
    id: "cf",
    code: "CF",
    name: "The Morris and Gwendolyn Cafritz Foundation Arts Center",
    category: "Academic",
    description: "Arts and cultural programming space with performance and creative education.",
    details: ["Fine Arts Center", "Workforce Development and Continuing Education"],
    x: 12.3,
    y: 18.8,
    width: 15.5,
    height: 14.5,
    routeNodeId: "cf",
  },
  {
    id: "cu",
    code: "CU",
    name: "Cultural Arts Center",
    category: "Academic",
    description: "Cultural arts venue and event-facing academic building on the west side.",
    details: ["Cultural arts programming", "Performance and event space"],
    x: 6.8,
    y: 9.5,
    width: 10.5,
    height: 12,
    routeNodeId: "cu",
  },
  {
    id: "hc",
    code: "HC",
    name: "Health Sciences Center",
    category: "Academic",
    description: "Health sciences instruction building near the Jesup Blair edge of campus.",
    details: ["Health sciences programs", "West-side academic building"],
    x: 8.2,
    y: 31.8,
    width: 8.5,
    height: 8,
    routeNodeId: "hc",
  },
  {
    id: "p1",
    code: "P1",
    name: "Pavilion One",
    category: "Campus Hub",
    description: "One of the pavilion buildings in the central campus cluster.",
    details: ["Pavilion building", "Near Raptor Central"],
    x: 69.8,
    y: 33.5,
    width: 4.7,
    height: 6.5,
    routeNodeId: "p1",
  },
  {
    id: "p2",
    code: "P2",
    name: "Pavilion Two",
    category: "Campus Hub",
    description: "Part of the central pavilion cluster near Student Services.",
    details: ["Pavilion building", "Near Raptor Central"],
    x: 75.3,
    y: 33.8,
    width: 4.7,
    height: 6.4,
    routeNodeId: "p2",
  },
  {
    id: "p3",
    code: "P3",
    name: "Pavilion Three",
    category: "Campus Hub",
    description: "Pavilion building south-east of the Student Services cluster.",
    details: ["Pavilion building", "Near New York Avenue edge"],
    x: 81.5,
    y: 45.5,
    width: 5.8,
    height: 8,
    routeNodeId: "p3",
  },
  {
    id: "p4",
    code: "P4",
    name: "Pavilion Four",
    category: "Campus Hub",
    description: "North-east pavilion building near Philadelphia Avenue.",
    details: ["Pavilion building", "Closest pavilion to the north-east edge"],
    x: 76.2,
    y: 21.2,
    width: 5.8,
    height: 7.2,
    routeNodeId: "p4",
  },
  {
    id: "mp",
    code: "MP",
    name: "Mathematics Pavilion",
    category: "Academic",
    description: "Math-focused pavilion space in the central campus cluster.",
    details: ["Academic pavilion", "Near Student Services"],
    x: 63.2,
    y: 50.8,
    width: 4.2,
    height: 4.8,
    routeNodeId: "mp",
  },
  {
    id: "np",
    code: "NP",
    name: "North Pavilion",
    category: "Campus Hub",
    description: "North Pavilion in the central services area.",
    details: ["Pavilion building", "Connected central campus cluster"],
    x: 66.5,
    y: 49.5,
    width: 4.4,
    height: 4.6,
    routeNodeId: "np",
  },
];

export const campusCategoryOrder: CampusCategory[] = [
  "Services",
  "Academic",
  "Campus Hub",
  "Parking",
];

export const tpssCampusRouteNodes: CampusRouteNode[] = [
  { id: "cu", x: 12.1, y: 15.5, label: "Cultural Arts Center" },
  { id: "cf", x: 19.6, y: 25.8, label: "Arts Center" },
  { id: "wg", x: 24.8, y: 24.5, label: "West Garage" },
  { id: "hc", x: 12.6, y: 35.8, label: "Health Sciences" },
  { id: "west_hub", x: 27.8, y: 33.8, label: "West Plaza" },
  { id: "bridge_west", x: 36.8, y: 39.8, label: "Bridge Entrance" },
  { id: "bridge_mid", x: 49.8, y: 41.8, label: "Pedestrian Bridge" },
  { id: "bridge_east", x: 58.6, y: 42.2, label: "Raptor Central" },
  { id: "st", x: 63.2, y: 46.4, label: "Student Services" },
  { id: "north_spine", x: 70.8, y: 39.2, label: "North Spine" },
  { id: "p1", x: 72.1, y: 36.2, label: "Pavilion One" },
  { id: "p2", x: 77.5, y: 36.7, label: "Pavilion Two" },
  { id: "p4", x: 79.2, y: 24.8, label: "Pavilion Four" },
  { id: "central_hub", x: 71.2, y: 49.6, label: "Central Hub" },
  { id: "np", x: 68.3, y: 51.5, label: "North Pavilion" },
  { id: "mp", x: 65.2, y: 53.5, label: "Math Pavilion" },
  { id: "p3", x: 84.1, y: 49.5, label: "Pavilion Three" },
  { id: "rc", x: 75.8, y: 58.4, label: "Resource Center" },
  { id: "sn", x: 63.9, y: 61.6, label: "Science North" },
  { id: "cm", x: 87.4, y: 64.6, label: "Charlene R. Nunley Center" },
  { id: "lb", x: 75.2, y: 75.2, label: "Leggett Building" },
  { id: "south_spine", x: 72.8, y: 65.2, label: "South Spine" },
  { id: "eg", x: 42.2, y: 18.5, label: "East Garage" },
];

export const tpssCampusRouteEdges: CampusRouteEdge[] = [
  { from: "cu", to: "cf", label: "west arts corridor" },
  { from: "cf", to: "wg", label: "west arts corridor" },
  { from: "cf", to: "west_hub", label: "west arts corridor" },
  { from: "hc", to: "west_hub", label: "west campus path" },
  { from: "wg", to: "west_hub", label: "garage access" },
  { from: "west_hub", to: "bridge_west", label: "pedestrian path" },
  { from: "bridge_west", to: "bridge_mid", label: "pedestrian bridge" },
  { from: "bridge_mid", to: "bridge_east", label: "pedestrian bridge" },
  { from: "bridge_east", to: "st", label: "raptor central approach" },
  { from: "bridge_east", to: "north_spine", label: "north campus walk" },
  { from: "bridge_east", to: "central_hub", label: "central services walk" },
  { from: "north_spine", to: "p1", label: "north pavilion walk" },
  { from: "north_spine", to: "p2", label: "north pavilion walk" },
  { from: "north_spine", to: "p4", label: "north campus walk" },
  { from: "st", to: "central_hub", label: "central services walk" },
  { from: "central_hub", to: "np", label: "central campus spine" },
  { from: "central_hub", to: "mp", label: "central campus spine" },
  { from: "central_hub", to: "rc", label: "east academic walk" },
  { from: "central_hub", to: "p3", label: "east campus walk" },
  { from: "central_hub", to: "south_spine", label: "south campus walk" },
  { from: "south_spine", to: "sn", label: "science corridor" },
  { from: "south_spine", to: "lb", label: "south campus walk" },
  { from: "south_spine", to: "cm", label: "south-east campus walk" },
  { from: "rc", to: "cm", label: "resource center walk" },
  { from: "rc", to: "lb", label: "science and library walk" },
  { from: "sn", to: "lb", label: "science corridor" },
  { from: "p3", to: "cm", label: "new york avenue side path" },
  { from: "eg", to: "bridge_mid", label: "garage crossing" },
  { from: "eg", to: "north_spine", label: "east garage approach" },
];

export const tpssLocationById = new Map(
  tpssCampusLocations.map((location) => [location.id, location])
);

export const tpssRouteNodeById = new Map(
  tpssCampusRouteNodes.map((node) => [node.id, node])
);

export const getCampusLocationLabel = (locationId: string) => {
  const location = tpssLocationById.get(locationId);
  return location ? `${location.code} · ${location.name}` : locationId.toUpperCase();
};
