// FR-008/FR-009 + BR-003 + DEC-001 — static filter vocabularies shared by the HIGHLIGHT KUDOS
// carousel and the ALL KUDOS feed (one filter state owned above both, per clarifications.md).
// Order is frozen by dom-contract.md S3/F21: option 1 is the value the seed data guarantees
// >=4 matches for, option 2 is the value that combines with the other menu's option 2 to reach
// zero matches (S5), and the clear item is always last.

/** Hashtag dropdown options, in menu order. The trailing entry clears the hashtag filter. */
export const HASHTAG_OPTIONS = ['#Dedicated', '#Inspring', 'Tất cả'] as const;

/** Department dropdown options, in menu order. The trailing entry clears the department filter. */
export const DEPARTMENT_OPTIONS = ['CEVC10', 'CECV10', 'Tất cả'] as const;

/** Shared "clear this filter" label — the last item in both menus above. */
export const CLEAR_OPTION_LABEL = 'Tất cả';
