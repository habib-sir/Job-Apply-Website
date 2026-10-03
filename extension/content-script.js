/**
 * Project: BD Job Autofill
 * Module: Content Script
 * Purpose: Detects form fields on the active page and fills them using the
 *          supplied profile data when triggered by the popup. Consults
 *          teletalk-mapping.js for exact name/id matches on Teletalk-style
 *          hostnames before falling back to generic label-text matching.
 * Author: Lead Engineer
 * Version: 1.10.0
 * Dependencies: teletalk-mapping.js
 * Last Updated: 2026-07-08
 *
 * Changelog 1.10.0: Fixed SSC/HSC (and Graduation/Masters) Result Type
 * selects sometimes requiring manual selection of "GPA(out of 5)" instead
 * of autofilling. Root cause: a bare "GPA" profile value matched multiple
 * options ("GPA(out of 4)" and "GPA(out of 5)") ambiguously, and the first
 * match won. setSelectValue now disambiguates using the paired numeric
 * result value (e.g. hscResult) to pick the correct scale, defaulting to
 * the out-of-5 scale used by current SSC/HSC grading in Bangladesh.
 */

/**
 * Maps profile field keys to arrays of matching patterns tested against
 * input name, id, placeholder, and associated label text (all lowercased).
 */
const FIELD_PATTERNS = {
  fullName: ['full name', 'fullname', 'name', 'applicant name', 'candidate name'],
  nameBn: ['name_bn', 'বাংলায়', 'bangla', "candidate's name (bangla)"],
  fatherName: ["father's name", 'father name', 'fathername', 'father'],
  fatherBn: ['father_bn', 'পিতার নাম', "father's name (bangla)"],
  motherName: ["mother's name", 'mother name', 'mothername', 'mother'],
  motherBn: ['mother_bn', 'মাতার নাম', "mother's name (bangla)"],
  dateOfBirth: ['date of birth', 'dob', 'birth date', 'birthdate'],
  gender: ['gender', 'sex'],
  nidNo: ['nid', 'national id', 'national identity', 'nid_no'],
  birthRegNo: ['birthreg', 'birth reg', 'birth registration', 'breg_no'],
  passportNo: ['passport', 'passport_no'],
  mobile: ['mobile', 'phone', 'contact number', 'cell'],
  mobileConfirm: ['confirm_mobile', 'confirm mobile', 'mobile_confirm'],
  email: ['email', 'e-mail'],
  presentCareOf: ['present_careof', 'present care of', 'care of'],
  presentAddress: ['present_village', 'present address', 'current address', 'mailing address', 'present village'],
  presentDistrict: ['present_district', 'present district'],
  presentUpazila: ['present_upazila', 'present upazila', 'present upazila/p.s.', 'present thana', 'present_thana'],
  presentPost: ['present_post', 'present post office', 'present post'],
  presentPostcode: ['present_postcode', 'present post code', 'present postcode'],
  permanentCareOf: ['permanent_careof', 'permanent care of'],
  permanentAddress: ['permanent_village', 'permanent address', 'permanent village'],
  permanentDistrict: ['permanent_district', 'permanent district'],
  permanentUpazila: ['permanent_upazila', 'permanent upazila', 'permanent upazila/p.s.', 'permanent thana', 'permanent_thana'],
  permanentPost: ['permanent_post', 'permanent post office', 'permanent post'],
  permanentPostcode: ['permanent_postcode', 'permanent post code', 'permanent postcode'],
  fatherOccupation: ["father's occupation", 'father occupation'],
  religion: ['religion'],
  nationality: ['nationality'],
  maritalStatus: ['marital status', 'marital_status'],
  spouseName: ['spouse name', 'spouse_name'],
  bloodGroup: ['blood group', 'bloodgroup'],
  quota: ['quota'],
  depStatus: ['departmental', 'candidate status', 'dep status', 'ds', 'dep_status'],
  sscExam: ['ssc_exam', 'ssc exam', 'ssc/equivalent'],
  sscRoll: ['ssc_roll', 'ssc roll'],
  sscGroup: ['ssc_group', 'ssc group', 'ssc_discipline', 'ssc board/discipline', 'ssc major'],
  sscBoard: ['ssc_board', 'ssc board'],
  sscBoardOther: ['ssc_board_other', 'ssc board other', 'ssc board (if other)', 'ssc other board'],
  sscGroupOther: ['ssc_group_other', 'ssc group other', 'ssc group (if other)', 'ssc other group'],
  sscResultType: ['ssc_result_type', 'ssc result type'],
  sscResult: ['ssc_result', 'ssc result', 'ssc score', 'ssc gpa', 'ssc marks'],
  sscYear: ['ssc_year', 'ssc year', 'ssc passing year'],
  hscExam: ['hsc_exam', 'hsc exam', 'hsc/equivalent'],
  hscRoll: ['hsc_roll', 'hsc roll'],
  hscGroup: ['hsc_group', 'hsc group', 'hsc_discipline', 'hsc board/discipline', 'hsc major'],
  hscBoard: ['hsc_board', 'hsc board'],
  hscBoardOther: ['hsc_board_other', 'hsc board other', 'hsc board (if other)', 'hsc other board'],
  hscGroupOther: ['hsc_group_other', 'hsc group other', 'hsc group (if other)', 'hsc other group'],
  hscResultType: ['hsc_result_type', 'hsc result type'],
  hscResult: ['hsc_result', 'hsc result', 'hsc score', 'hsc gpa', 'hsc marks'],
  hscYear: ['hsc_year', 'hsc year', 'hsc passing year'],
  graExam: ['gra_exam', 'gra exam', 'graduation exam', 'graduation level', 'graduation degree', 'graduation/equivalent', 'degree (honours/etc)'],
  graInstitute: ['gra_institute', 'gra institute', 'graduation institute', 'graduation university', 'university/institute', 'university', 'institute'],
  graSubject: ['gra_subject', 'gra subject', 'graduation subject', 'graduation major', 'subject/major', 'subject', 'major'],
  graResultType: ['gra_result_type', 'graduation result type'],
  graResult: ['gra_result', 'gra result', 'graduation result', 'graduation cgpa', 'cgpa', 'gpa'],
  graYear: ['gra_year', 'gra year', 'graduation passing year', 'graduation year'],
  graDuration: ['gra_duration', 'graduation duration', 'course duration'],
  masExam: ['mas_exam', 'mas exam', 'masters exam', 'masters level', 'masters degree'],
  masInstitute: ['mas_institute', 'mas institute', 'masters institute', 'masters university'],
  masSubject: ['mas_subject', 'mas subject', 'masters subject', 'masters major'],
  masResultType: ['mas_result_type', 'masters result type'],
  masResult: ['mas_result', 'mas result', 'masters result', 'masters cgpa'],
  masYear: ['mas_year', 'mas year', 'masters passing year', 'masters year'],
  masDuration: ['mas_duration', 'masters duration'],
  bachelor: ['bachelor', 'graduation', 'honours'],
  master: ['master', 'masters', 'post-graduation'],
  experienceComputer: ['word processing', 'email', 'fax machine', 'computer efficiency', 'experience in computer', 'efficiency in word'],
  experienceSatlipi: ['satlipi', 'typing speed', 'words per minute', 'wpm']
};

/**
 * Normalizes a string for pattern matching: lowercase, trimmed, collapsed spaces,
 * and removes punctuation like dots, dashes, etc. for fuzzy matching.
 * @param {string} value
 * @returns {string}
 */
function normalize(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[\s\.\-_,()']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Builds a searchable text blob describing a form element (name, id,
 * placeholder, aria-label, and any associated <label> text).
 * @param {HTMLElement} element
 * @returns {string}
 */
function describeElement(element) {
  const parts = [
    element.getAttribute('name'),
    element.getAttribute('id'),
    element.getAttribute('placeholder'),
    element.getAttribute('aria-label')
  ];

  if (element.id) {
    const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (label) {
      parts.push(label.textContent);
    }
  }

  const parentLabel = element.closest('label');
  if (parentLabel) {
    parts.push(parentLabel.textContent);
  }

  return normalize(parts.filter(Boolean).join(' '));
}

/**
 * Finds the profile field key that best matches a form element's description.
 * @param {string} description
 * @returns {string|null}
 */
function matchFieldKey(description) {
  for (const [fieldKey, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      if (description.includes(pattern)) {
        return fieldKey;
      }
    }
  }
  return null;
}

/**
 * Sets a value on a text-like input/textarea and dispatches events so
 * frameworks (React/Vue/vanilla listeners) observe the change.
 * @param {HTMLInputElement|HTMLTextAreaElement} element
 * @param {string} value
 */
function setTextValue(element, value) {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor && descriptor.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Selects a matching <option> in a <select> element by visible text or value.
 * Uses fuzzy matching to handle variations like "S.S.C" vs "SSC".
 * @param {HTMLSelectElement} element
 * @param {string} value
 * @returns {boolean} whether a match was applied
 */
function setSelectValue(element, value, expectedNumericResult) {
  const target = normalize(value);

  const applyOption = (option) => {
    element.value = option.value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  // Exact match on text or value wins immediately (unambiguous).
  for (const option of element.options) {
    if (target === normalize(option.textContent) || target === normalize(option.value)) {
      return applyOption(option);
    }
  }

  // Marital status equivalence: 'single' and 'unmarried' are interchangeable across job portals
  if (target === 'single' || target === 'unmarried') {
    for (const option of element.options) {
      const optText = normalize(option.textContent);
      const optVal = normalize(option.value);
      if (optText === 'single' || optVal === 'single' || optText === 'unmarried' || optVal === 'unmarried') {
        return applyOption(option);
      }
    }
  }

  // Ambiguous "scale" values like a bare "GPA" or "Division" can match
  // several options at once (e.g. "GPA(out of 4)" AND "GPA(out of 5)").
  // When that happens, prefer the option whose scale (the number in
  // "out of N") matches the numeric result already present/queued for
  // this field's paired result input, defaulting to the out-of-5 scale
  // used by current SSC/HSC/equivalent grading in Bangladesh.
  const isBareGpa = target === 'gpa' || target === 'cgpa';
  if (isBareGpa) {
    const candidates = Array.from(element.options).filter((option) => {
      const optText = normalize(option.textContent);
      return optText.includes('gpa') || optText.includes('cgpa');
    });
    if (candidates.length > 1) {
      // Prefer the numeric result value passed in from the profile data
      // (reliable even if the paired input hasn't been filled yet, since
      // DOM fill order may process the *_result_type select before the
      // *_result input). Fall back to reading the DOM input if present.
      let numericResult = parseFloat(expectedNumericResult);
      if (Number.isNaN(numericResult)) {
        const pairedInput = findPairedResultInput(element);
        numericResult = pairedInput ? parseFloat(pairedInput.value || pairedInput.getAttribute('value') || '') : NaN;
      }
      let preferredScale = 5;
      if (!Number.isNaN(numericResult)) {
        preferredScale = numericResult > 4 ? 5 : (numericResult <= 4 ? 4 : 5);
      }
      const scaleMatch = candidates.find((option) => normalize(option.textContent).includes(`out of ${preferredScale}`));
      if (scaleMatch) {
        return applyOption(scaleMatch);
      }
      // No explicit scale in options text matched; fall back to the
      // highest-scale GPA option (out of 5 beats out of 4) since that is
      // the current standard scale for SSC/HSC in Bangladesh.
      const sorted = candidates
        .map((option) => ({ option, scale: parseInt((normalize(option.textContent).match(/out of (\d+)/) || [])[1] || '0', 10) }))
        .sort((a, b) => b.scale - a.scale);
      if (sorted.length > 0 && sorted[0].scale > 0) {
        return applyOption(sorted[0].option);
      }
    } else if (candidates.length === 1) {
      return applyOption(candidates[0]);
    }
  }

  for (const option of element.options) {
    const optText = normalize(option.textContent);
    if (optText.includes(target) && target.length > 0) {
      return applyOption(option);
    }
  }
  // Reverse containment: handles cases where the profile value is more
  // specific/verbose than the option text, e.g. profile "GPA(out of 5.00)"
  // vs an option literally labelled "GPA(out of 5)".
  for (const option of element.options) {
    const optText = normalize(option.textContent);
    if (optText.length > 0 && target.includes(optText)) {
      return applyOption(option);
    }
  }
  return false;
}

/**
 * Given a "*_result_type" select element, locates its paired "*_result"
 * numeric input (e.g. ssc_result_type -> ssc_result) so the GPA scale
 * (out of 4 vs out of 5) can be inferred from the actual numeric value.
 * @param {HTMLSelectElement} element
 * @returns {HTMLInputElement|null}
 */
function findPairedResultInput(element) {
  const name = element.getAttribute('name') || '';
  const id = element.getAttribute('id') || '';
  const base = name.replace(/_type$/, '') || id.replace(/_type$/, '');
  if (!base) return null;
  return document.querySelector(`[name="${CSS.escape(base)}"], #${CSS.escape(base)}`);
}

/**
 * Checks a radio button whose value or label matches the given value.
 * @param {string} name
 * @param {string} value
 * @returns {boolean} whether a match was applied
 */
function setRadioValue(name, value) {
  const target = normalize(value);
  const radios = document.querySelectorAll(`input[type="radio"][name="${CSS.escape(name)}"]`);
  for (const radio of radios) {
    const description = describeElement(radio);
    if (description.includes(target) || normalize(radio.value) === target) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }
  return false;
}

/**
 * Resolves table-level context for an element.
 * @param {HTMLElement} element
 * @returns {object|null}
 */
function getTableContext(element) {
  const cell = element.closest('td, th');
  if (!cell) return null;

  const row = cell.closest('tr');
  if (!row) return null;

  const table = row.closest('table');
  if (!table) return null;

  const cells = Array.from(row.cells);
  const colIndex = cells.indexOf(cell);
  if (colIndex === -1) return null;

  const rowHeaderText = row.cells[0] ? row.cells[0].textContent.trim() : '';

  let headerRow = table.querySelector('thead tr');
  if (!headerRow) {
    headerRow = table.querySelector('tr');
  }

  let colHeaderText = '';
  if (headerRow && headerRow !== row) {
    const headerCells = Array.from(headerRow.cells);
    if (headerCells[colIndex]) {
      colHeaderText = headerCells[colIndex].textContent.trim();
    }
  }

  return {
    rowHeaderText,
    colHeaderText,
    colIndex
  };
}

/**
 * Resolves surrounding non-table container context.
 * @param {HTMLElement} element
 * @returns {object}
 */
function getContainerContext(element) {
  let parent = element.parentElement;
  let depth = 0;
  let sectionText = '';
  let labelText = '';

  if (element.id) {
    const labelEl = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (labelEl) {
      labelText = labelEl.textContent.trim();
    }
  }
  if (!labelText) {
    const parentLabel = element.closest('label');
    if (parentLabel) {
      labelText = parentLabel.textContent.trim();
    }
  }

  while (parent && depth < 5) {
    const header = parent.querySelector('h1, h2, h3, h4, h5, h6, legend, .section-title, .card-header, .form-section-title');
    if (header) {
      sectionText = header.textContent.trim();
      break;
    }

    let prev = parent.previousElementSibling;
    while (prev) {
      if (/h[1-6]|legend/i.test(prev.tagName) || prev.classList.contains('section-title') || prev.classList.contains('form-section-title')) {
        sectionText = prev.textContent.trim();
        break;
      }
      prev = prev.previousElementSibling;
    }
    if (sectionText) break;

    parent = parent.parentElement;
    depth++;
  }

  return {
    sectionText,
    labelText
  };
}

/**
 * Detects the specific education level (ssc, hsc, gra, mas) from surrounding contexts.
 * @param {string} rowHeader
 * @param {string} sectionText
 * @param {string} name
 * @param {string} id
 * @param {string} labelText
 * @param {string} placeholder
 * @returns {string|null}
 */
function detectEducationLevel(rowHeader, sectionText, name, id, labelText, placeholder) {
  const combined = [rowHeader, sectionText, name, id, labelText, placeholder]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (combined.includes('master') || combined.includes('m.sc') || combined.includes('msc') || combined.includes('mba') || combined.includes('m.a') || combined.includes('ma ') || combined.includes('mas_') || combined.includes('postgraduate') || combined.includes('post-graduate') || combined.includes('m.com') || combined.includes('mcom')) {
    return 'mas';
  }

  if (combined.includes('graduation') || combined.includes('bachelor') || combined.includes('honours') || combined.includes('honors') || combined.includes('gra_') || combined.includes('b.sc') || combined.includes('bsc') || combined.includes('b.a') || (/\bba\b/).test(combined) || combined.includes('bba') || combined.includes('b.com') || combined.includes('bcom') || combined.includes('undergraduate') || combined.includes('engineering') || combined.includes('engg') || combined.includes('degree')) {
    if (combined.includes('ssc') || combined.includes('hsc') || combined.includes('secondary')) {
      if (!combined.includes('graduation') && !combined.includes('bachelor') && !combined.includes('honours') && !combined.includes('gra_')) {
        // Continue to check other levels
      } else {
        return 'gra';
      }
    } else {
      return 'gra';
    }
  }

  if (combined.includes('hsc') || combined.includes('higher secondary') || combined.includes('intermediate') || combined.includes('alim') || combined.includes('a level') || combined.includes('a-level')) {
    return 'hsc';
  }

  if (combined.includes('ssc') || combined.includes('secondary school') || combined.includes('matric') || combined.includes('dakhil') || combined.includes('o level') || combined.includes('o-level')) {
    return 'ssc';
  }

  return null;
}

/**
 * Detects the education field type from the column, label, names, and IDs.
 * @param {string} colHeader
 * @param {string} labelText
 * @param {string} name
 * @param {string} id
 * @param {string} placeholder
 * @param {string} level
 * @returns {string|null}
 */
function detectEducationFieldType(colHeader, labelText, name, id, placeholder, level) {
  // Check name/id explicitly first — they are the most reliable signals and
  // avoid false positives from column headers like "Result Type & Score" that
  // would otherwise cause a plain result input to be classified as resultType.
  const nameIdLower = [name, id].filter(Boolean).join(' ').toLowerCase();

  // Explicit "other" board/group text boxes (shown when the board/group
  // selected is "Other") must be detected before the generic board/group
  // checks below, otherwise they'd resolve to sscBoard/sscGroup and clobber
  // the real board/group field.
  if (nameIdLower.match(/board_?other|other_?board/)) {
    return 'boardOther';
  }
  if (nameIdLower.match(/group_?other|other_?group|subject_?other|other_?subject/)) {
    return 'groupOther';
  }

  if (nameIdLower.match(/result_?type|gradetype/)) {
    return 'resultType';
  }
  // Matches ssc_result, sscResult, ssc_result_score, ssc_result_value, etc.
  // (not just an exact "_result" suffix) so merged column headers like
  // "Result Type & Score" can't hijack the plain score/result input.
  if (nameIdLower.match(/result/) && !nameIdLower.match(/result_?type/)) {
    return 'result';
  }
  if (nameIdLower.match(/\bboard\b/) || nameIdLower.match(/\binstitute\b/) || nameIdLower.match(/\buniversity\b/)) {
    return (level === 'ssc' || level === 'hsc') ? 'board' : 'institute';
  }
  if (nameIdLower.match(/\broll\b/) || nameIdLower.match(/\bindex\b/) || nameIdLower.match(/\bsymbol\b/)) {
    return 'roll';
  }
  if (nameIdLower.match(/\byear\b/) || nameIdLower.match(/passing_?year/)) {
    return 'year';
  }
  if (nameIdLower.match(/\bduration\b/)) {
    return 'duration';
  }
  if (nameIdLower.match(/\bgroup\b/) || nameIdLower.match(/\bsubject\b/) || nameIdLower.match(/\bmajor\b/) || nameIdLower.match(/\bdiscipline\b/)) {
    return (level === 'ssc' || level === 'hsc') ? 'group' : 'subject';
  }
  if (nameIdLower.match(/\bexam\b/) || nameIdLower.match(/\bdegree\b/)) {
    return 'exam';
  }

  const combined = [colHeader, labelText, name, id, placeholder]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (combined.includes('result type') || combined.includes('grading') || combined.includes('gpa type') || combined.includes('result_type') || combined.includes('scale') || combined.includes('class/division')) {
    return 'resultType';
  }

  if (combined.includes('board') || combined.includes('university') || combined.includes('institute') || combined.includes('institution') || combined.includes('school') || combined.includes('college') || combined.includes('varsity')) {
    if (level === 'ssc' || level === 'hsc') {
      return 'board';
    } else {
      return 'institute';
    }
  }

  if (combined.includes('roll') || combined.includes('index') || combined.includes('symbol')) {
    return 'roll';
  }

  if (combined.includes('result') || combined.includes('cgpa') || combined.includes('gpa') || combined.includes('grade') || combined.includes('score') || combined.includes('marks') || combined.includes('division') || combined.includes('class')) {
    return 'result';
  }

  if (combined.includes('year') || combined.includes('passing') || combined.includes('pass_year') || combined.includes('passing_year')) {
    return 'year';
  }

  if (combined.includes('duration') || combined.includes('course duration')) {
    return 'duration';
  }

  if (combined.includes('group') || combined.includes('subject') || combined.includes('major') || combined.includes('discipline') || combined.includes('department') || combined.includes('stream') || combined.includes('branch')) {
    if (level === 'ssc' || level === 'hsc') {
      return 'group';
    } else {
      return 'subject';
    }
  }

  if (combined.includes('exam') || combined.includes('degree') || combined.includes('examination') || combined.includes('title') || combined.includes('course')) {
    return 'exam';
  }

  return null;
}

/**
 * Smartly resolves field keys for the Education/Graduation section by analyzing
 * table structures, headers, labels, and surrounding DOM context.
 * @param {HTMLElement} element
 * @returns {string|null}
 */
function resolveEducationFieldKey(element) {
  const tableCtx = getTableContext(element);
  const containerCtx = getContainerContext(element);

  const rowHeader = tableCtx ? tableCtx.rowHeaderText : '';
  const colHeader = tableCtx ? tableCtx.colHeaderText : '';
  const sectionText = containerCtx ? containerCtx.sectionText : '';
  const labelText = containerCtx ? containerCtx.labelText : '';

  const name = element.getAttribute('name') || '';
  const id = element.getAttribute('id') || '';
  const placeholder = element.getAttribute('placeholder') || '';

  const level = detectEducationLevel(rowHeader, sectionText, name, id, labelText, placeholder);
  if (!level) return null;

  const fieldType = detectEducationFieldType(colHeader, labelText, name, id, placeholder, level);
  if (!fieldType) return null;

  const resolvedKey = `${level}${fieldType.charAt(0).toUpperCase()}${fieldType.slice(1)}`;

  const validEducationKeys = [
    'sscExam', 'sscRoll', 'sscGroup', 'sscGroupOther', 'sscBoard', 'sscBoardOther', 'sscResultType', 'sscResult', 'sscYear',
    'hscExam', 'hscRoll', 'hscGroup', 'hscGroupOther', 'hscBoard', 'hscBoardOther', 'hscResultType', 'hscResult', 'hscYear',
    'graExam', 'graInstitute', 'graSubject', 'graResultType', 'graResult', 'graYear', 'graDuration',
    'masExam', 'masInstitute', 'masSubject', 'masResultType', 'masResult', 'masYear', 'masDuration'
  ];

  if (validEducationKeys.includes(resolvedKey)) {
    return resolvedKey;
  }

  return null;
}

/**
 * Resolves a profile field key for a form element: tries the smart education
 * field resolver, then falls back to Teletalk exact name/id map first (when the
 * active hostname qualifies), then falls back to generic label-text matching.
 * @param {HTMLElement} element
 * @returns {string|null}
 */
function resolveFieldKey(element) {
  const eduKey = resolveEducationFieldKey(element);
  if (eduKey) {
    return eduKey;
  }

  if (typeof isTeletalkHostname === 'function' && isTeletalkHostname(window.location.hostname)) {
    const exactKey = resolveTeletalkFieldKey(element.getAttribute('name'), element.getAttribute('id'));
    if (exactKey) {
      return exactKey;
    }
  }
  return matchFieldKey(describeElement(element));
}

/**
 * Special handling for specific form fields that need extra logic.
 * @param {HTMLElement} element
 * @param {object} profileData
 * @param {Array} filledFields
 * @returns {boolean} whether the field was handled and filled
 */
function handleSpecialFields(element, profileData, filledFields) {
  const name = element.getAttribute('name');
  const id = element.getAttribute('id');

  if (name === 'nid' || id === 'nid') {
    const hasNid = profileData.nidNo && profileData.nidNo.trim() !== '';
    const valueToSet = hasNid ? '1' : '0';
    const option = Array.from(element.options).find(opt => opt.value === valueToSet);
    if (option) {
      element.value = option.value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      filledFields.push({ key: 'nid', label: 'Have National ID?', value: valueToSet === '1' ? 'Yes' : 'No' });
      return true;
    }
  }

  if (name === 'breg' || id === 'breg') {
    const hasBreg = profileData.birthRegNo && profileData.birthRegNo.trim() !== '';
    const valueToSet = hasBreg ? '1' : '0';
    const option = Array.from(element.options).find(opt => opt.value === valueToSet);
    if (option) {
      element.value = option.value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      filledFields.push({ key: 'breg', label: 'Have Birth Registration?', value: valueToSet === '1' ? 'Yes' : 'No' });
      return true;
    }
  }

  if (name === 'passport' || id === 'passport') {
    const hasPassport = profileData.passportNo && profileData.passportNo.trim() !== '';
    const valueToSet = hasPassport ? '1' : '0';
    const option = Array.from(element.options).find(opt => opt.value === valueToSet);
    if (option) {
      element.value = option.value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      filledFields.push({ key: 'passport', label: 'Have Passport?', value: valueToSet === '1' ? 'Yes' : 'No' });
      return true;
    }
  }

  if (name === 'same_as_present' || id === 'same_as_present') {
    if (profileData.sameAsPresent) {
      element.checked = true;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      filledFields.push({ key: 'same_as_present', label: 'Same as Present Address', value: 'Yes' });
      return true;
    }
  }

  // Graduation "If Applicable" checkbox — matches common name/id variants.
  // Ticks automatically when any graduation-level data exists in the profile.
  const isGraApplicable =
    name === 'if_applicable_gra' || id === 'if_applicable_gra' ||
    name === 'gra_applicable'    || id === 'gra_applicable'    ||
    name === 'graduation_applicable' || id === 'graduation_applicable' ||
    name === 'bachelor_applicable'   || id === 'bachelor_applicable';
  if (isGraApplicable) {
    const hasGraData =
      (profileData.graExam    && profileData.graExam.trim()    !== '') ||
      (profileData.graInstitute && profileData.graInstitute.trim() !== '') ||
      (profileData.bachelor   && profileData.bachelor.trim()   !== '');
    if (hasGraData) {
      element.checked = true;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      filledFields.push({ key: 'if_applicable_gra', label: 'Graduation Level Applicable', value: 'Yes' });
      return true;
    }
  }

  // Masters "If Applicable" checkbox — matches common name/id variants.
  // Ticks automatically when any masters-level data exists in the profile.
  const isMasApplicable =
    name === 'if_applicable_mas' || id === 'if_applicable_mas' ||
    name === 'mas_applicable'    || id === 'mas_applicable'    ||
    name === 'masters_applicable'|| id === 'masters_applicable'||
    name === 'master_applicable' || id === 'master_applicable';
  if (isMasApplicable) {
    const hasMasData =
      (profileData.masExam    && profileData.masExam.trim()    !== '') ||
      (profileData.masInstitute && profileData.masInstitute.trim() !== '') ||
      (profileData.master     && profileData.master.trim()     !== '');
    if (hasMasData) {
      element.checked = true;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      filledFields.push({ key: 'if_applicable_mas', label: 'Masters Level Applicable', value: 'Yes' });
      return true;
    }
  }

  if (name === 'agree' || id === 'agree') {
    element.checked = true;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    filledFields.push({ key: 'agree', label: 'Agree to Declaration', value: 'Yes' });
    return true;
  }

  return false;
}

/**
 * Maps field keys to a user-friendly English label for display in the feedback toast.
 * @param {string} fieldKey
 * @param {HTMLElement} [element]
 * @returns {string}
 */
function getFieldLabel(fieldKey, element) {
  const keyToFriendlyName = {
    fullName: 'Applicant Name (English)',
    nameBn: 'Applicant Name (Bangla)',
    fatherName: "Father's Name (English)",
    fatherBn: "Father's Name (Bangla)",
    motherName: "Mother's Name (English)",
    motherBn: "Mother's Name (Bangla)",
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    nidNo: 'National ID Number',
    birthRegNo: 'Birth Registration Number',
    passportNo: 'Passport Number',
    mobile: 'Mobile Number',
    mobileConfirm: 'Confirm Mobile Number',
    email: 'Email Address',
    presentCareOf: 'Present Address: Care of',
    presentAddress: 'Present Address: Village',
    presentDistrict: 'Present Address: District',
    presentUpazila: 'Present Address: Upazila/P.S.',
    presentPost: 'Present Address: Post Office',
    presentPostcode: 'Present Address: Post Code',
    permanentCareOf: 'Permanent Address: Care of',
    permanentAddress: 'Permanent Address: Village',
    permanentDistrict: 'Permanent Address: District',
    permanentUpazila: 'Permanent Address: Upazila/P.S.',
    permanentPost: 'Permanent Address: Post Office',
    permanentPostcode: 'Permanent Address: Post Code',
    fatherOccupation: "Father's Occupation",
    religion: 'Religion',
    nationality: 'Nationality',
    maritalStatus: 'Marital Status',
    spouseName: "Spouse's Name",
    bloodGroup: 'Blood Group',
    quota: 'Quota',
    depStatus: 'Departmental Candidate Status',
    sscExam: 'SSC Exam Name',
    sscRoll: 'SSC Roll Number',
    sscGroup: 'SSC Group',
    sscBoard: 'SSC Board',
    sscBoardOther: 'SSC Board (Other)',
    sscGroupOther: 'SSC Group (Other)',
    sscResultType: 'SSC Result Type',
    sscResult: 'SSC Result',
    sscYear: 'SSC Passing Year',
    hscExam: 'HSC Exam Name',
    hscRoll: 'HSC Roll Number',
    hscGroup: 'HSC Group',
    hscBoard: 'HSC Board',
    hscBoardOther: 'HSC Board (Other)',
    hscGroupOther: 'HSC Group (Other)',
    hscResultType: 'HSC Result Type',
    hscResult: 'HSC Result',
    hscYear: 'HSC Passing Year',
    graExam: 'Graduation Level',
    graInstitute: 'Graduation University',
    graSubject: 'Graduation Subject',
    graResultType: 'Graduation Result Type',
    graResult: 'Graduation Result/CGPA',
    graYear: 'Graduation Passing Year',
    graDuration: 'Graduation Duration',
    masExam: 'Masters Level',
    masInstitute: 'Masters University',
    masSubject: 'Masters Subject',
    masResultType: 'Masters Result Type',
    masResult: 'Masters Result/CGPA',
    masYear: 'Masters Passing Year',
    masDuration: 'Masters Duration',
    experienceComputer: 'Computer Experience',
    experienceSatlipi: 'Shorthand Speed'
  };

  if (keyToFriendlyName[fieldKey]) {
    return keyToFriendlyName[fieldKey];
  }

  if (element && element.id) {
    const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (label && label.textContent.trim()) {
      return label.textContent.trim().replace(/\s+/g, ' ');
    }
  }
  const parentLabel = element ? element.closest('label') : null;
  if (parentLabel && parentLabel.textContent.trim()) {
    return parentLabel.textContent.trim().replace(/\s+/g, ' ');
  }

  return fieldKey;
}

/**
 * Fills all matchable form fields on the page using the given profile.
 * @param {Record<string, string>} profileData
 * @returns {{filledCount: number, filledFields: Array<{key: string, label: string, value: string}>}}
 */
function fillForm(profileData) {
  let filledCount = 0;
  const seenRadioNames = new Set();
  const filledFields = [];

  const formElements = document.querySelectorAll('input, select, textarea');

  for (const element of formElements) {
    const type = (element.getAttribute('type') || '').toLowerCase();

    if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'file' || element.disabled) {
      continue;
    }

    if (handleSpecialFields(element, profileData, filledFields)) {
      filledCount++;
      continue;
    }

    // Check custom fields first for highest flexibility/override capability
    if (Array.isArray(profileData.customFields)) {
      const description = describeElement(element);
      const nameVal = (element.getAttribute('name') || '').toLowerCase();
      const idVal = (element.getAttribute('id') || '').toLowerCase();
      
      let foundCustom = false;
      for (const customField of profileData.customFields) {
        if (!customField.key) continue;
        const normKey = normalize(customField.key);
        if (description.includes(normKey) || (nameVal && nameVal.includes(normKey)) || (idVal && idVal.includes(normKey))) {
          if (type === 'radio') {
            const name = element.getAttribute('name');
            if (name && !seenRadioNames.has(name)) {
              if (setRadioValue(name, customField.value)) {
                filledCount += 1;
                seenRadioNames.add(name);
                if (!filledFields.some(f => f.key === customField.key)) {
                  filledFields.push({ key: customField.key, label: customField.key, value: customField.value });
                }
                foundCustom = true;
                break;
              }
            }
          } else if (element.tagName === 'SELECT') {
            if (setSelectValue(element, customField.value)) {
              filledCount += 1;
              if (!filledFields.some(f => f.key === customField.key)) {
                filledFields.push({ key: customField.key, label: customField.key, value: customField.value });
              }
              foundCustom = true;
              break;
            }
          } else {
            setTextValue(element, customField.value);
            filledCount += 1;
            if (!filledFields.some(f => f.key === customField.key)) {
              filledFields.push({ key: customField.key, label: customField.key, value: customField.value });
            }
            foundCustom = true;
            break;
          }
        }
      }
      if (foundCustom) {
        continue;
      }
    }

    if (type === 'radio') {
      const name = element.getAttribute('name');
      if (!name || seenRadioNames.has(name)) {
        continue;
      }
      const fieldKey = resolveFieldKey(element) || matchFieldKey(name.toLowerCase());
      const profileValue = fieldKey ? profileData[fieldKey] : undefined;
      if (profileValue && setRadioValue(name, profileValue)) {
        filledCount += 1;
        seenRadioNames.add(name);
        if (!filledFields.some(f => f.key === fieldKey)) {
          filledFields.push({ key: fieldKey, label: getFieldLabel(fieldKey, element), value: profileValue });
        }
      }
      continue;
    }

    if (type === 'checkbox') {
      continue;
    }

    const fieldKey = resolveFieldKey(element);
    if (!fieldKey) {
      continue;
    }

    const profileValue = profileData[fieldKey];
    if (profileValue === undefined || profileValue === null || profileValue === '') {
      continue;
    }

    if (element.tagName === 'SELECT') {
      // For *ResultType selects (sscResultType, hscResultType, etc.), pass
      // along the paired numeric result (sscResult, hscResult, etc.) so a
      // bare "GPA" value can be resolved to the correct out-of-4/out-of-5
      // option instead of ambiguously matching the first "GPA" option.
      const pairedResultKey = fieldKey.endsWith('ResultType') ? fieldKey.replace(/ResultType$/, 'Result') : null;
      const pairedResultValue = pairedResultKey ? profileData[pairedResultKey] : undefined;
      if (setSelectValue(element, profileValue, pairedResultValue)) {
        filledCount += 1;
        if (!filledFields.some(f => f.key === fieldKey)) {
          filledFields.push({ key: fieldKey, label: getFieldLabel(fieldKey, element), value: profileValue });
        }
      }
      continue;
    }

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      setTextValue(element, profileValue);
      filledCount += 1;
      if (!filledFields.some(f => f.key === fieldKey)) {
        filledFields.push({ key: fieldKey, label: getFieldLabel(fieldKey, element), value: profileValue });
      }
    }
  }

  // Handle Teletalk special field structures (split DOB, radios, same-as-present, media)
  handleTeletalkSpecialFields(profileData);
  injectMediaFiles(profileData);

  // Select elements (Upazila/P.S., Result Type, etc.) are frequently populated
  // asynchronously — either on a timer or in response to another field's
  // 'change' event (e.g. choosing a Board/Exam loads that board's grading
  // scale options for Result Type). Fixed delays can miss slow loads, so in
  // addition to a couple of fallback timers we watch the DOM and retry the
  // moment new <option> elements actually show up.
  setTimeout(() => {
    retrySelectElements(profileData);
  }, 200);

  setTimeout(() => {
    retrySelectElements(profileData);
  }, 600);

  setTimeout(() => {
    retrySelectElements(profileData);
  }, 1500);

  observeSelectsAndRetry(profileData);

  return { filledCount, filledFields };
}

/**
 * Watches the page for newly-inserted <option> elements (a sign that a
 * <select>'s choices were just populated asynchronously) and immediately
 * retries filling select elements when that happens. Auto-disconnects after
 * a few seconds so it doesn't run indefinitely.
 * @param {object} profileData
 */
function observeSelectsAndRetry(profileData) {
  let debounceTimer = null;
  const observer = new MutationObserver((mutations) => {
    const sawNewOptions = mutations.some((mutation) =>
      Array.from(mutation.addedNodes).some(
        (node) => node.nodeName === 'OPTION' || (node.querySelectorAll && node.querySelectorAll('option').length > 0)
      )
    );
    if (!sawNewOptions) {
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      retrySelectElements(profileData);
    }, 120);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    clearTimeout(debounceTimer);
    observer.disconnect();
  }, 8000);
}

/**
 * Re-attempts to set values for select elements. Necessary for fields
 * like Upazila/P.S. that are loaded dynamically based on District selection.
 * @param {object} profileData
 */
function retrySelectElements(profileData) {
  const selectElements = document.querySelectorAll('select');
  for (const element of selectElements) {
    if (element.disabled) {
      continue;
    }
    const fieldKey = resolveFieldKey(element);
    if (!fieldKey) {
      // Also retry custom fields
      if (Array.isArray(profileData.customFields)) {
        const description = describeElement(element);
        const nameVal = (element.getAttribute('name') || '').toLowerCase();
        const idVal = (element.getAttribute('id') || '').toLowerCase();
        for (const customField of profileData.customFields) {
          if (!customField.key) continue;
          const normKey = normalize(customField.key);
          if (description.includes(normKey) || (nameVal && nameVal.includes(normKey)) || (idVal && idVal.includes(normKey))) {
            setSelectValue(element, customField.value);
            break;
          }
        }
      }
      continue;
    }
    const profileValue = profileData[fieldKey];
    if (profileValue !== undefined && profileValue !== null && profileValue !== '') {
      const pairedResultKey = fieldKey.endsWith('ResultType') ? fieldKey.replace(/ResultType$/, 'Result') : null;
      const pairedResultValue = pairedResultKey ? profileData[pairedResultKey] : undefined;
      setSelectValue(element, profileValue, pairedResultValue);
    }
  }
}

// Handle PING (readiness check) and AUTOFILL_PAGE messages from the popup.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'PING') {
    sendResponse({ ok: true });
    return true;
  }

  if (!message || message.type !== 'AUTOFILL_PAGE') {
    return false;
  }

  try {
    const profile = message.payload || {};
    const { filledCount, filledFields } = fillForm(profile);
    injectMediaFiles(profile);
    sendResponse({ ok: true, data: { filledCount, filledFields } });
  } catch (error) {
    sendResponse({ ok: false, error: error.message });
  }

  return false;
});

/**
 * Handles Teletalk-specific complex field patterns such as split DOB dropdowns,
 * Yes/No verification radio buttons (NID, Birth Reg, Passport), and Same-as-present checkbox.
 * @param {object} profileData
 */
function handleTeletalkSpecialFields(profileData) {
  if (!profileData) return;

  // 1. Date of Birth split dropdowns (Day, Month, Year)
  if (profileData.dateOfBirth) {
    let day = '', month = '', year = '';
    const dobStr = String(profileData.dateOfBirth).trim();
    if (dobStr.includes('-')) {
      const parts = dobStr.split('-');
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    } else if (dobStr.includes('/')) {
      const parts = dobStr.split('/');
      if (parts[2] && parts[2].length === 4) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    }

    if (day && month && year) {
      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const mIdx = parseInt(month, 10) - 1;
      const mName = monthNames[mIdx] || '';
      const dayNum = String(parseInt(day, 10));
      const dayPad = day.padStart(2, '0');
      const monthNum = String(parseInt(month, 10));
      const monthPad = month.padStart(2, '0');

      // Day select
      const daySelects = document.querySelectorAll('select[name*="day" i], select[id*="day" i], select[name*="b_day" i]');
      for (const sel of daySelects) {
        for (const opt of sel.options) {
          const val = opt.value.trim();
          const txt = opt.text.trim();
          if (val === dayNum || val === dayPad || txt === dayNum || txt === dayPad) {
            sel.value = opt.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      }

      // Month select
      const monthSelects = document.querySelectorAll('select[name*="month" i], select[id*="month" i], select[name*="b_month" i]');
      for (const sel of monthSelects) {
        for (const opt of sel.options) {
          const val = opt.value.trim().toLowerCase();
          const txt = opt.text.trim().toLowerCase();
          if (
            val === monthNum || val === monthPad || txt === monthNum || txt === monthPad ||
            (mName && (val.includes(mName) || txt.includes(mName) || txt.startsWith(mName.slice(0, 3))))
          ) {
            sel.value = opt.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      }

      // Year select
      const yearSelects = document.querySelectorAll('select[name*="year" i], select[id*="year" i], select[name*="b_year" i]');
      for (const sel of yearSelects) {
        for (const opt of sel.options) {
          const val = opt.value.trim();
          const txt = opt.text.trim();
          if (val === year || txt === year) {
            sel.value = opt.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            break;
          }
        }
      }
    }
  }

  // 2. NID Yes/No Radios
  const nidRadios = document.querySelectorAll('input[type="radio"][name*="nid" i]:not([name*="no" i])');
  if (nidRadios.length > 0) {
    const hasNid = Boolean(profileData.nidNo && profileData.nidNo.length >= 10);
    for (const r of nidRadios) {
      const val = (r.value || '').toLowerCase();
      const desc = describeElement(r);
      const isYes = val === 'yes' || val === '1' || val === 'y' || desc.includes('yes');
      const isNo = val === 'no' || val === '2' || val === 'n' || desc.includes('no');
      if (hasNid && isYes) {
        r.checked = true;
        r.dispatchEvent(new Event('change', { bubbles: true }));
        r.dispatchEvent(new Event('click', { bubbles: true }));
      } else if (!hasNid && isNo) {
        r.checked = true;
        r.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  // 3. Birth Registration Yes/No Radios
  const bregRadios = document.querySelectorAll('input[type="radio"][name*="breg" i]:not([name*="no" i]), input[type="radio"][name*="birth" i]');
  if (bregRadios.length > 0) {
    const hasBreg = Boolean(profileData.birthRegNo);
    for (const r of bregRadios) {
      const val = (r.value || '').toLowerCase();
      const desc = describeElement(r);
      const isYes = val === 'yes' || val === '1' || val === 'y' || desc.includes('yes');
      const isNo = val === 'no' || val === '2' || val === 'n' || desc.includes('no');
      if (hasBreg && isYes) {
        r.checked = true;
        r.dispatchEvent(new Event('change', { bubbles: true }));
        r.dispatchEvent(new Event('click', { bubbles: true }));
      } else if (!hasBreg && isNo) {
        r.checked = true;
        r.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  // 4. Passport Yes/No Radios
  const passRadios = document.querySelectorAll('input[type="radio"][name*="passport" i]:not([name*="no" i])');
  if (passRadios.length > 0) {
    const hasPass = Boolean(profileData.passportNo);
    for (const r of passRadios) {
      const val = (r.value || '').toLowerCase();
      const desc = describeElement(r);
      const isYes = val === 'yes' || val === '1' || val === 'y' || desc.includes('yes');
      const isNo = val === 'no' || val === '2' || val === 'n' || desc.includes('no');
      if (hasPass && isYes) {
        r.checked = true;
        r.dispatchEvent(new Event('change', { bubbles: true }));
        r.dispatchEvent(new Event('click', { bubbles: true }));
      } else if (!hasPass && isNo) {
        r.checked = true;
        r.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  // 5. Same As Present Checkbox
  const sameCheckbox = document.querySelector('input[type="checkbox"][name*="same" i], input[type="checkbox"][id*="same" i]');
  if (sameCheckbox) {
    const isSame =
      profileData.sameAsPresent === true ||
      (profileData.presentDistrict &&
        profileData.permanentDistrict &&
        profileData.presentDistrict.toLowerCase() === profileData.permanentDistrict.toLowerCase() &&
        profileData.presentAddress === profileData.permanentAddress);
    if (isSame && !sameCheckbox.checked) {
      sameCheckbox.checked = true;
      sameCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      sameCheckbox.dispatchEvent(new Event('click', { bubbles: true }));
    }
  }
}

/**
 * Injects photo and signature files into Teletalk file inputs if dataURLs are provided.
 */
function injectMediaFiles(profileData) {
  if (!profileData) return;

  if (profileData.photoDataUrl) {
    const photoInputs = document.querySelectorAll(
      'input[type="file"][name*="photo" i], input[type="file"][id*="photo" i], input[type="file"][name*="picture" i]'
    );
    for (const input of photoInputs) {
      setFileInputFromDataUrl(input, profileData.photoDataUrl, 'applicant_photo_300x300.jpg');
    }
  }

  if (profileData.signatureDataUrl) {
    const sigInputs = document.querySelectorAll(
      'input[type="file"][name*="sig" i], input[type="file"][id*="sig" i]'
    );
    for (const input of sigInputs) {
      setFileInputFromDataUrl(input, profileData.signatureDataUrl, 'applicant_signature_300x80.jpg');
    }
  }
}

function setFileInputFromDataUrl(inputElement, dataUrl, filename) {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return false;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], filename, { type: mime });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputElement.files = dataTransfer.files;
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  } catch (e) {
    console.warn('Could not inject file input:', e);
    return false;
  }
}

// -------------------------------------------------------------
// Career Portal Admin Bridge (Listens for Autofill payloads)
// -------------------------------------------------------------
function announceExtensionPresence() {
  window.postMessage({ type: 'BD_JOB_AUTOFILL_EXTENSION_READY', version: '1.2.0' }, '*');
  document.documentElement.setAttribute('data-bd-autofill-extension-installed', 'true');
}

// Announce presence immediately and after DOM load
announceExtensionPresence();
window.addEventListener('load', announceExtensionPresence);

function handlePortalAutofillMessage(data) {
  if (!data || typeof data !== 'object') return;
  const { type, payload } = data;

  if (type === 'CAREER_PORTAL_AUTOFILL' || type === 'TELE_AUTOFILL_DATA') {
    if (!payload) return;

    chrome.runtime.sendMessage(
      {
        type: 'IMPORT_AND_ACTIVATE_PROFILE',
        payload: payload,
      },
      (response) => {
        const isOk = response && response.ok;
        const pName = payload.fullName || payload.name || 'Applicant';

        window.postMessage(
          {
            type: 'CAREER_PORTAL_AUTOFILL_ACK',
            success: isOk,
            profileId: response?.data?.id,
            profileName: pName,
            error: response?.error,
          },
          '*'
        );

        document.dispatchEvent(
          new CustomEvent('CAREER_PORTAL_AUTOFILL_ACK', {
            detail: { success: isOk, profileName: pName },
          })
        );

        showPortalToast(`✓ BD Job Autofill: [${pName}] এর তথ্য এক্সটেনশনে সক্রিয় হয়েছে!`);
      }
    );
  }
}

window.addEventListener('message', (event) => {
  if (!event.data) return;
  handlePortalAutofillMessage(event.data);
});

document.addEventListener('CAREER_PORTAL_AUTOFILL', (event) => {
  if (event.detail) {
    handlePortalAutofillMessage({ type: 'CAREER_PORTAL_AUTOFILL', payload: event.detail });
  }
});

function showPortalToast(text) {
  let toast = document.getElementById('bd-autofill-portal-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'bd-autofill-portal-toast';
    toast.style.cssText =
      'position: fixed; bottom: 24px; right: 24px; z-index: 999999; background: #065f46; color: #ecfdf5; padding: 12px 18px; border-radius: 10px; font-family: sans-serif; font-size: 13px; font-weight: 600; box-shadow: 0 10px 25px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 8px; border: 1px solid #10b981; transition: all 0.3s ease;';
    document.body.appendChild(toast);
  }
  toast.innerText = text;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }
  }, 4000);
}

// -------------------------------------------------------------
// Teletalk Floating Autofill Toolbar
// -------------------------------------------------------------
function checkAndInjectTeletalkToolbar() {
  const isTeletalk = isTeletalkHostname(window.location.hostname);
  if (!isTeletalk) return;

  chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROFILE' }, (response) => {
    const profile = response && response.ok ? response.data : null;
    if (!profile) return;

    // Check if session expired
    if (profile.expiresAt && Date.now() > profile.expiresAt) {
      return;
    }

    // Auto-detect and auto-inject photo/signature if file inputs exist on this page
    const fileInputsFound = document.querySelectorAll(
      'input[type="file"][name*="photo" i], input[type="file"][name*="picture" i], input[type="file"][name*="sig" i]'
    );
    const hasMediaInputs = fileInputsFound.length > 0;
    if (hasMediaInputs && (profile.photoDataUrl || profile.signatureDataUrl)) {
      setTimeout(() => {
        injectMediaFiles(profile);
      }, 300);
    }

    if (document.getElementById('bd-autofill-teletalk-bar')) {
      // Update existing bar if applicant changed
      const nameElem = document.getElementById('bd-autofill-applicant-name');
      if (nameElem) nameElem.textContent = profile.fullName || profile.name || 'সক্রিয় প্রার্থী';
      return;
    }

    const bar = document.createElement('div');
    bar.id = 'bd-autofill-teletalk-bar';
    bar.style.cssText =
      'position: sticky; top: 0; left: 0; width: 100%; z-index: 9999999; background: linear-gradient(90deg, #064e3b, #065f46); color: #fff; padding: 8px 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.25); border-bottom: 2px solid #10b981; box-sizing: border-box;';

    // Calculate remaining session minutes
    let timeText = '';
    if (profile.expiresAt) {
      const remainingMs = profile.expiresAt - Date.now();
      const remainingMin = Math.max(1, Math.round(remainingMs / 60000));
      timeText = `⏳ সেশন: ${remainingMin} মিনিট`;
    }

    const leftInfo = document.createElement('div');
    leftInfo.style.cssText = 'display: flex; align-items: center; gap: 10px; flex-wrap: wrap;';
    leftInfo.innerHTML = `
      <span style="background: #10b981; color: #064e3b; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">⚡ BD JOB AUTOFILL</span>
      <span>প্রার্থী: <strong id="bd-autofill-applicant-name">${profile.fullName || profile.name || 'সক্রিয় প্রার্থী'}</strong></span>
      ${profile.appId ? `<span style="background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 4px; font-size: 11px;">#ID: ${profile.appId}</span>` : ''}
      ${profile.postName ? `<span style="color: #a7f3d0; font-weight: 500;">[পদ: ${profile.postName}]</span>` : ''}
      ${timeText ? `<span style="color: #fde68a; font-size: 11px;">${timeText}</span>` : ''}
    `;

    const rightActions = document.createElement('div');
    rightActions.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-wrap: wrap;';

    // Main autofill button
    const btnAutofill = document.createElement('button');
    btnAutofill.type = 'button';
    btnAutofill.style.cssText =
      'background: #10b981; hover:background: #059669; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.15s ease;';
    btnAutofill.innerHTML = '⚡ এক ক্লিকে ফর্ম পূরণ করুন';

    // Dedicated Photo & Signature button
    const btnMedia = document.createElement('button');
    btnMedia.type = 'button';
    btnMedia.style.cssText =
      'background: #0284c7; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);';
    btnMedia.innerHTML = '📷 ছবি ও স্বাক্ষর দিন';
    if (!profile.photoDataUrl && !profile.signatureDataUrl) {
      btnMedia.style.opacity = '0.5';
      btnMedia.title = 'প্রার্থীর ছবি বা স্বাক্ষর নেই';
    }

    // Dismiss / Close session button
    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.style.cssText =
      'background: transparent; color: #94a3b8; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer;';
    btnClose.title = 'ফ্লোটিং বার লুকান';
    btnClose.innerHTML = '✕';

    const statusSpan = document.createElement('span');
    statusSpan.style.cssText = 'font-size: 12px; color: #6ee7b7; font-weight: 500;';

    btnAutofill.onclick = () => {
      try {
        const { filledCount } = fillForm(profile);
        injectMediaFiles(profile);
        statusSpan.innerText = `✓ ${filledCount}টি ফিল্ড ও ছবি/স্বাক্ষর সফলভাবে পূরণ হয়েছে!`;
        btnAutofill.style.background = '#047857';
      } catch (err) {
        statusSpan.innerText = `ইরর: ${err.message}`;
      }
    };

    btnMedia.onclick = () => {
      try {
        injectMediaFiles(profile);
        statusSpan.innerText = '✓ ৩০০×৩০০ ছবি এবং ৩০০×৮০ স্বাক্ষর সফলভাবে সংযুক্ত করা হয়েছে!';
        btnMedia.style.background = '#0369a1';
      } catch (err) {
        statusSpan.innerText = `ইরর: ${err.message}`;
      }
    };

    btnClose.onclick = () => {
      bar.remove();
    };

    rightActions.appendChild(btnAutofill);
    rightActions.appendChild(btnMedia);
    rightActions.appendChild(statusSpan);
    rightActions.appendChild(btnClose);

    bar.appendChild(leftInfo);
    bar.appendChild(rightActions);

    document.body.prepend(bar);
  });
}

// Check Teletalk toolbar on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInjectTeletalkToolbar);
} else {
  checkAndInjectTeletalkToolbar();
}
