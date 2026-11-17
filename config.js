/*
  SITE SETTINGS
  Change these to point the "Send feedback" and "Request an exercise" links somewhere.

  Option 1 (recommended): make a free Google Form (the privacy page says Google Forms),
  then paste its share link between the quotes below. Answers collect in the form's own spreadsheet.

  Option 2: leave the form links empty and put an email address in contactEmail.
  The links will then open a pre-filled email to that address instead.
*/
/*
  VISITOR COUNTER (GoatCounter)
  Paste your GoatCounter site code into goatcounterCode below. It's the first part of your
  GoatCounter address: for https://replab.goatcounter.com the code is "replab".
  While it's empty, nothing is counted. See counter.js for exactly what is sent.
*/
window.SITE_CONFIG = {
  feedbackFormUrl: "",          // e.g. "https://forms.gle/abc123"
  exerciseRequestFormUrl: "",   // e.g. "https://tally.so/r/xyz789"
  contactEmail: "",             // e.g. "physio.handouts@nhs.net"
  goatcounterCode: "replab"     // GoatCounter site code ("" switches counting off)
};
