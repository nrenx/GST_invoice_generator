import { HSNCode } from "@/types/invoice";

export const hsnCodes: HSNCode[] = [
  { code: "4401", description: "Wood in chips or particles; sawdust and wood waste", rate: 8, cgst: 2.5, sgst: 2.5, igst: 5 },
  { code: "4404", description: "Hoopwood; split poles; piles, pickets and stakes (Casuarina Poles)", rate: 35, cgst: 6, sgst: 6, igst: 12 },
  { code: "4405", description: "Wood wool; wood flour", rate: 16, cgst: 6, sgst: 6, igst: 12 },
  { code: "4406", description: "Railway or tramway sleepers of wood", rate: 1500, cgst: 6, sgst: 6, igst: 12 },
  { code: "4408", description: "Sheets for veneering, for plywood", rate: 95, cgst: 6, sgst: 6, igst: 12 },
  { code: "4409", description: "Bamboo flooring", rate: 190, cgst: 6, sgst: 6, igst: 12 },
  { code: "4601", description: "Mats, matting and screens of vegetable material", rate: 250, cgst: 2.5, sgst: 2.5, igst: 5 },
  { code: "4823", description: "Articles made of paper mache", rate: 1000, cgst: 2.5, sgst: 2.5, igst: 5 },
];

export const uomOptions = ["MTS", "KGS", "NOS", "PCS", "TONS", "QTLS", "BOXES", "BAGS"];

export const transportModes = ["By Lorry", "By Road", "By Rail", "By Air", "By Ship"];

export const indianStates = [
  { name: "Andhra Pradesh", code: "37" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Assam", code: "18" },
  { name: "Bihar", code: "10" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Goa", code: "30" },
  { name: "Gujarat", code: "24" },
  { name: "Haryana", code: "06" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jharkhand", code: "20" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Maharashtra", code: "27" },
  { name: "Manipur", code: "14" },
  { name: "Meghalaya", code: "17" },
  { name: "Mizoram", code: "15" },
  { name: "Nagaland", code: "13" },
  { name: "Odisha", code: "21" },
  { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" },
  { name: "Sikkim", code: "11" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Tripura", code: "16" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Uttarakhand", code: "05" },
  { name: "West Bengal", code: "19" },
];
