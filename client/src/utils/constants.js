export const genderOptions = [
  { label: "Select gender", value: "" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "I do not wish to answer", value: "prefer_not_to_answer" }
];

export const workAuthorizationOptions = [
  { label: "Select status", value: "" },
  { label: "Citizen", value: "citizen" },
  { label: "Green Card", value: "green_card" },
  { label: "H1-B", value: "h1b" },
  { label: "L2", value: "l2" },
  { label: "F1 (CPT/OPT)", value: "f1_opt" },
  { label: "H4", value: "h4" },
  { label: "Other", value: "other" }
];

export const visaSteps = [
  {
    type: "opt_receipt",
    title: "OPT Receipt",
    pending: "Waiting for HR to approve your OPT Receipt.",
    approved: "Please upload a copy of your OPT EAD.",
    rejected: "Upload an updated OPT Receipt based on HR feedback."
  },
  {
    type: "opt_ead",
    title: "OPT EAD",
    pending: "Waiting for HR to approve your OPT EAD.",
    approved: "Please download and fill out the I-983 form.",
    rejected: "Upload an updated OPT EAD."
  },
  {
    type: "i_983",
    title: "Form I-983",
    pending: "Waiting for HR to approve and sign your I-983.",
    approved: "Please send the signed I-983 to your school and upload the new I-20.",
    rejected: "Upload a corrected I-983."
  },
  {
    type: "i_20",
    title: "I-20",
    pending: "Waiting for HR to approve your I-20.",
    approved: "All documents have been approved.",
    rejected: "Upload the updated I-20."
  }
];

export const documentLabels = {
  profile_picture: "Profile Picture",
  drivers_license: "Driver's License",
  work_authorization: "Work Authorization",
  opt_receipt: "OPT Receipt",
  opt_ead: "OPT EAD",
  i_983: "Form I-983",
  i_20: "I-20"
};
