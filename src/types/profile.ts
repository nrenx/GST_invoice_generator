export interface ProfileCompanyDetails {
  companyName: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  email: string;
  phone: string;
}

export interface Profile {
  id: string;
  name: string;
  companyDetails: ProfileCompanyDetails;
  termsAndConditions: string;
  avatar?: string;
}

// Hardcoded PINs for default profiles
export const PROFILE_PINS: Record<string, string> = {
  narendra: '9640',
  raja: '2018',
  simhadri: '6303',
  nageswarao: '9640',
};

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'narendra',
    name: 'Narendra',
    companyDetails: {
      companyName: 'KAVERI TRADERS',
      address: '191, Guduru, Pagadalapalli, Idulapalli, Tirupati, Andhra Pradesh - 524409',
      city: 'Tirupati',
      state: 'Andhra Pradesh',
      stateCode: '37',
      pincode: '524409',
      gstin: '37HERPB7733F1Z5',
      email: 'bollineninarendragst@gmail.com',
      phone: ''
    },
    termsAndConditions: '1. This is an electronically generated invoice.\n2. All disputes are subject to GUDUR jurisdiction only.\n3. Goods once sold will not be taken back or exchanged.\n4. Payment shall be made as agreed; ownership passes only after full payment.\n5. This invoice is issued in accordance with GST laws in force in India.'
  },
  {
    id: 'raja',
    name: 'Raja',
    companyDetails: {
      companyName: 'SRI VENKATESWARA TRADERS',
      address: 'Flat No. 175, EDALAPALLI (V), Gudur Mandal, Tirupati Dist., A.P',
      city: 'Gudur',
      state: 'Andhra Pradesh',
      stateCode: '37',
      pincode: '524409',
      gstin: '37ENTPB8227G2ZL',
      email: '',
      phone: '8106332018'
    },
    termsAndConditions: '1. This is an electronically generated invoice.\n2. All disputes are subject to GUDUR jurisdiction only.\n3. Goods once sold will not be taken back or exchanged.\n4. Payment shall be made as agreed; ownership passes only after full payment.\n5. This invoice is issued in accordance with GST laws in force in India.'
  },
  {
    id: 'simhadri',
    name: 'Simhadri',
    companyDetails: {
      companyName: 'SIMHADRI TRADERS',
      address: '6-59-1,NTR colony,Venkatagiri,Tirupati Dist,A.P',
      city: 'Venkatagiri',
      state: 'Andhra Pradesh',
      stateCode: '37',
      pincode: '524132',
      gstin: '37CCRPV8719C1ZW',
      email: 'simhadrikw3@gmail.com',
      phone: ''
    },
    termsAndConditions: '1. This is an electronically generated invoice.\n2. All disputes are subject to Venkatagiri jurisdiction only.\n3. Goods once sold will not be taken back or exchanged.\n4. Payment shall be made as agreed; ownership passes only after full payment.\n5. This invoice is issued in accordance with GST laws in force in India.'
  },
  {
    id: 'nageswarao',
    name: 'Nageswarao',
    companyDetails: {
      companyName: 'PARAMESWARA TRADERS',
      address: '1-36-1-C,MannetiKota,Ulavapadu,Nellore Dist,A.P',
      city: 'Ulavapadu',
      state: 'Andhra Pradesh',
      stateCode: '37',
      pincode: '523292',
      gstin: '37CTLPG5883R1ZK',
      email: 'gaddaguntanageswarao@gmail.com',
      phone: ''
    },
    termsAndConditions: '1. This is an electronically generated invoice.\n2. All disputes are subject to Ulavapadu jurisdiction only.\n3. Goods once sold will not be taken back or exchanged.\n4. Payment shall be made as agreed; ownership passes only after full payment.\n5. This invoice is issued in accordance with GST laws in force in India.'
  }
];
