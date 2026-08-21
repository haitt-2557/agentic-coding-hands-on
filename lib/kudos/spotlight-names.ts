// FR-010/FR-011 — SPOTLIGHT BOARD word cloud (design/kudos-content.md §4.7). All 106 name TEXT
// nodes from the frame, transcribed row for row with their own node id so a reviewer can trace
// any coordinate back to the source. `relX`/`relY` are board-relative (origin 142,1658); the
// consuming component (Phase 6) scales them into its own container — no word-cloud library, no
// recomputed layout (F38). One row per line keeps this 106-row file under the 200-line ceiling.

export interface SpotlightNode {
  id: string;
  name: string;
  relX: number;
  relY: number;
  fontSize: number;
  highlighted: boolean;
}

/** Board container size at 1x (design/kudos-content.md §4.2): 1157 × 548. */
export const BOARD_WIDTH = 1157;
export const BOARD_HEIGHT = 548;

export const SPOTLIGHT_TOTAL_LABEL = '388 KUDOS';
export const SPOTLIGHT_TICKER_LINE = '08:30PM Nguyễn Bá Chức đã nhận được một Kudos mới';

// The 4 distinct font sizes on the frame (§4.7), factored out since 97 of 106 rows share FS_BASE.
const FS_BASE = 6.656088829040527;
const FS_2 = 7.937238693237305;
const FS_3 = 10.205020904541016;
const FS_4 = 11.338912010192871;

// prettier-ignore
export const SPOTLIGHT_NODES: SpotlightNode[] = [
  { id: '2995:15926', name: 'Đỗ hoàng Hiệp', relX: 945, relY: 49, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15925', name: 'Đỗ hoàng Hiệp', relX: 841, relY: 63, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14186', name: 'Đỗ hoàng Hiệp', relX: 239, relY: 67, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15936', name: 'Dương thúy An', relX: 988, relY: 68, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14193', name: 'Đỗ hoàng Hiệp', relX: 378, relY: 72, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15935', name: 'Dương thúy An', relX: 757, relY: 74, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14195', name: 'Dương thúy An', relX: 514, relY: 81, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15941', name: 'Mai phương Thúy ', relX: 902, relY: 85, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14188', name: 'Dương thúy An', relX: 283, relY: 87, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15940', name: 'Mai phương Thúy ', relX: 670, relY: 91, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14196', name: 'Mai phương Thúy ', relX: 428, relY: 98, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15956', name: 'Lê Kiều Trang', relX: 1025, relY: 99, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14189', name: 'Mai phương Thúy ', relX: 196, relY: 104, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15955', name: 'Lê Kiều Trang', relX: 793, relY: 105, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15931', name: 'Nguyễn Văn Quy', relX: 945, relY: 105, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15930', name: 'Nguyễn Văn Quy', relX: 703, relY: 108, fontSize: FS_3, highlighted: false },
  { id: '2940:14199', name: 'Lê Kiều Trang', relX: 551, relY: 112, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14192', name: 'Lê Kiều Trang', relX: 319, relY: 118, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14194', name: 'Nguyễn Văn Quy', relX: 471, relY: 118, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14187', name: 'Nguyễn Văn Quy', relX: 229, relY: 121, fontSize: FS_3, highlighted: false },
  { id: '2995:15946', name: 'Nguyễn Bá Chức', relX: 864, relY: 122, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15945', name: 'Nguyễn Bá Chức', relX: 632, relY: 127, fontSize: FS_2, highlighted: false },
  { id: '2940:14197', name: 'Nguyễn Bá Chức', relX: 390, relY: 135, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15951', name: 'Nguyễn Hoàng Linh', relX: 958, relY: 136, fontSize: FS_4, highlighted: false },
  { id: '2940:14190', name: 'Nguyễn Bá Chức', relX: 158, relY: 140, fontSize: FS_2, highlighted: false },
  { id: '2995:15950', name: 'Nguyễn Hoàng Linh', relX: 729, relY: 143, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14198', name: 'Nguyễn Hoàng Linh', relX: 484, relY: 149, fontSize: FS_4, highlighted: true },
  { id: '2995:15927', name: 'Đỗ hoàng Hiệp', relX: 851, relY: 154, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14191', name: 'Nguyễn Hoàng Linh', relX: 255, relY: 156, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15929', name: 'Đỗ hoàng Hiệp', relX: 639, relY: 161, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14200', name: 'Đỗ hoàng Hiệp', relX: 377, relY: 167, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14214', name: 'Đỗ hoàng Hiệp', relX: 165, relY: 174, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15937', name: 'Dương thúy An', relX: 895, relY: 174, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15954', name: 'Nguyễn Hoàng Linh', relX: 991, relY: 180, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15939', name: 'Dương thúy An', relX: 682, relY: 181, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14202', name: 'Dương thúy An', relX: 421, relY: 187, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15942', name: 'Mai phương Thúy ', relX: 808, relY: 191, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14219', name: 'Nguyễn Hoàng Linh', relX: 517, relY: 193, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14216', name: 'Dương thúy An', relX: 208, relY: 194, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15944', name: 'Mai phương Thúy ', relX: 596, relY: 198, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14203', name: 'Mai phương Thúy ', relX: 334, relY: 204, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15957', name: 'Lê Kiều Trang', relX: 932, relY: 204, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15932', name: 'Nguyễn Văn Quy', relX: 851, relY: 210, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15949', name: 'Nguyễn Bá Chức', relX: 1052, relY: 210, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14217', name: 'Mai phương Thúy ', relX: 122, relY: 211, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15959', name: 'Lê Kiều Trang', relX: 719, relY: 212, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14206', name: 'Lê Kiều Trang', relX: 458, relY: 217, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14201', name: 'Nguyễn Văn Quy', relX: 377, relY: 223, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14218', name: 'Nguyễn Bá Chức', relX: 578, relY: 223, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15928', name: 'Đỗ hoàng Hiệp', relX: 976, relY: 224, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14220', name: 'Lê Kiều Trang', relX: 245, relY: 225, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15947', name: 'Nguyễn Bá Chức', relX: 770, relY: 227, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14215', name: 'Nguyễn Văn Quy', relX: 165, relY: 230, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15934', name: 'Nguyễn Văn Quy', relX: 660, relY: 233, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14207', name: 'Đỗ hoàng Hiệp', relX: 502, relY: 237, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14204', name: 'Nguyễn Bá Chức', relX: 296, relY: 240, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15952', name: 'Nguyễn Hoàng Linh', relX: 868, relY: 242, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15938', name: 'Dương thúy An', relX: 1020, relY: 244, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14205', name: 'Nguyễn Hoàng Linh', relX: 394, relY: 255, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14209', name: 'Dương thúy An', relX: 546, relY: 257, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15943', name: 'Mai phương Thúy ', relX: 933, relY: 261, fontSize: FS_BASE, highlighted: false },
  { id: '2995:16030', name: 'Nguyễn Bá Chức', relX: 737, relY: 269, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15984', name: 'Nguyễn Bá Chức', relX: 133, relY: 272, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14210', name: 'Mai phương Thúy ', relX: 459, relY: 274, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15958', name: 'Lê Kiều Trang', relX: 1056, relY: 274, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15979', name: 'Mai phương Thúy ', relX: 235, relY: 279, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15933', name: 'Nguyễn Văn Quy', relX: 976, relY: 280, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14213', name: 'Lê Kiều Trang', relX: 582, relY: 287, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14208', name: 'Nguyễn Văn Quy', relX: 502, relY: 293, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15948', name: 'Nguyễn Bá Chức', relX: 895, relY: 297, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14211', name: 'Nguyễn Bá Chức', relX: 421, relY: 310, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15994', name: 'Lê Kiều Trang', relX: 329, relY: 312, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15953', name: 'Nguyễn Hoàng Linh', relX: 992, relY: 312, fontSize: FS_BASE, highlighted: false },
  { id: '2940:14212', name: 'Nguyễn Hoàng Linh', relX: 518, relY: 325, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15961', name: 'Đỗ hoàng Hiệp', relX: 885, relY: 330, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15960', name: 'Đỗ hoàng Hiệp', relX: 653, relY: 335, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15982', name: 'Nguyễn Bá Chức', relX: 296, relY: 347, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15971', name: 'Dương thúy An', relX: 928, relY: 349, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15970', name: 'Dương thúy An', relX: 697, relY: 355, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15987', name: 'Nguyễn Hoàng Linh', relX: 393, relY: 362, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15973', name: 'Dương thúy An', relX: 545, relY: 363, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15976', name: 'Mai phương Thúy ', relX: 842, relY: 366, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15975', name: 'Mai phương Thúy ', relX: 610, relY: 372, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15978', name: 'Mai phương Thúy ', relX: 458, relY: 380, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15991', name: 'Lê Kiều Trang', relX: 965, relY: 380, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15990', name: 'Lê Kiều Trang', relX: 733, relY: 386, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15966', name: 'Nguyễn Văn Quy', relX: 885, relY: 386, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15965', name: 'Nguyễn Văn Quy', relX: 643, relY: 389, fontSize: FS_3, highlighted: false },
  { id: '2995:15981', name: 'Nguyễn Bá Chức', relX: 804, relY: 403, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15980', name: 'Nguyễn Bá Chức', relX: 572, relY: 408, fontSize: FS_2, highlighted: false },
  { id: '2995:15986', name: 'Nguyễn Hoàng Linh', relX: 898, relY: 417, fontSize: FS_4, highlighted: false },
  { id: '2995:15985', name: 'Nguyễn Hoàng Linh', relX: 669, relY: 424, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15962', name: 'Đỗ hoàng Hiệp', relX: 791, relY: 435, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15964', name: 'Đỗ hoàng Hiệp', relX: 579, relY: 442, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15972', name: 'Dương thúy An', relX: 835, relY: 455, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15989', name: 'Nguyễn Hoàng Linh', relX: 931, relY: 461, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15974', name: 'Dương thúy An', relX: 622, relY: 462, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15977', name: 'Mai phương Thúy ', relX: 748, relY: 472, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15992', name: 'Lê Kiều Trang', relX: 872, relY: 485, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15967', name: 'Nguyễn Văn Quy', relX: 791, relY: 491, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15969', name: 'Nguyễn Văn Quy', relX: 579, relY: 498, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15963', name: 'Đỗ hoàng Hiệp', relX: 916, relY: 505, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15993', name: 'Lê Kiều Trang', relX: 996, relY: 555, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15968', name: 'Nguyễn Văn Quy', relX: 916, relY: 561, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15983', name: 'Nguyễn Bá Chức', relX: 835, relY: 578, fontSize: FS_BASE, highlighted: false },
  { id: '2995:15988', name: 'Nguyễn Hoàng Linh', relX: 932, relY: 593, fontSize: FS_BASE, highlighted: false },
];
