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
      email: 'kotidarisetty7777@gmail.com',
      phone: ''
    },
    termsAndConditions: '1. This is an electronically generated invoice.\n2. All disputes are subject to GUDUR jurisdiction only.\n3. If the Consignee makes any Inter State Sale, he has to pay GST himself.\n4. Goods once sold cannot be taken back or exchanged.\n5. Payment terms as per agreement between buyer and seller.'
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
    termsAndConditions: '1. This is an electronically generated invoice.\n2. All disputes are subject to GUDUR jurisdiction only.\n3. If the Consignee makes any Inter State Sale, he has to pay GST himself.\n4. Goods once sold cannot be taken back or exchanged.\n5. Payment terms as per agreement between buyer and seller.'
  }
];
