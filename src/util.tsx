// define types
// CodeOverview
export type Cell = {
  no: number; // used for cell id
  id: string; // store the initial id
  cellType: string;

  isSelected: boolean;
  relation: object | undefined;
  bindToSlides: number[];

  inputs: any;
  outputs: any;

  inputLines: number;
  media: MediaData[] | undefined;

  isChanged: boolean;
};

export type Cell4Backend = {
  cellID: number | string; // used for cell id
  id?: string; // store the initial id
  order?: number;
  cellType: string;

  source: any;
  outputs: any;

  media?: {
    cellID?: string;
    mediaID: string;
    type: MediaType;
    isChosen: boolean;
  }[];

  isChosen?: boolean;
  maxGroup?: number;
};

export type CellRelation = {
  source: number; // corresponding to cell no
  target: number;
  weight: number;
};

export enum CellState {
  // Default = 'darkgray',
  // CurrentOn = '#5cd65c',
  // Select = 'orange',
  // Bind = 'red',

  // Default = '#bababa',
  // CurrentOn = '#abdda4',
  // Select = '#fdae61',
  // Changed = '#d7191c',
  // RelevantLeft = '#eef8ec',
  // RelevantRight = '#abdda4'

  // Default = '#bababa',
  // CurrentOn = '#a6d96a',
  // Select = '#fdae61',
  // Changed = '#d7191c',
  // RelevantLeft = '#f3faeb',
  // RelevantRight = '#a6d96a'

  // Default = '#bababa',
  // CurrentOn = '#7fc97f',
  // Select = '#fdc086',
  // Changed = '#d7191c',
  // RelevantLeft = '#dbf0db',
  // RelevantRight = '#7fc97f'

  // Default = '#bababa',
  // CurrentOn = '#a2c2dd',
  // Select = '#fbb4ae',
  // Changed = '#d7191c',
  // RelevantLeft = '#ecf3f8',
  // RelevantRight = '#a2c2dd'

  // Default = '#bababa',
  // CurrentOn = '#a0ccf8',
  // Select = '#fbb4ae',
  // Changed = '#d7191c',
  // RelevantLeft = '#e7f2fd',
  // RelevantRight = '#a0ccf8'

  Default = '#bababa',
  CurrentOn = '#88bff6',
  Select = '#faa59e',
  Changed = '#d7191c',
  RelevantLeft = '#e7f2fd',
  RelevantRight = '#a0ccf8'
}

// ControlPanel
export type SlideMeta = {
  title: string;
  author?: string;
  theme?: string;
};

export type ContentUnit = {
  tag: string;
  titles: { title: string; id: string; index: number }[];
};

export type SlideData = {
  active: boolean;
  id: string; // id = slide-index

  connectedCells: number[]; // only need to know what cells are chosen, store cell.no instead
  constraint: Contraint; // may not support

  tag: string;
  title: {
    title: string;
    state: TitleState;
    original: string;
    apiState: APIState;
  };
  titles: Title[];
  bulletPoints: BulletPoint[];
  medias: MediaData4Slide[];

  groupSize: number; // may not need, can be calculate by layouts[activeLayoutIndex].groupSize
  activeLayoutIndex: number;
  layouts: SlideLayout[];
  gridLayouts: GLPosition[];
  gridLayoutsRecord: { layout: GLPosition[]; adjustCount: number };

  navis: []; // Todo: to be specified

  state: MarkState;
  templateType: TemplateType;
  templateDisplay: TemplateDisplay[];
  comment: string;

  apiState: APIState;
};

export type Contraint = {
  audienceLevel: number;
  detailLevel: number;
  autoMerge: boolean;
};

export type SlideTag = {
  tag: string;
  type: SourceType;
  weight?: number;
};

export type Title = {
  title: string;
  type: SourceType;
  weight?: number;
  isChosen: boolean;
  model?: string;
};

export type DropDownItem = {
  label?: string;
  key?: string;
  type?: string;
};

export enum SourceType {
  Markdown = 'markdown',
  Code = 'code',
  Man = 'man',
  Template = 'template'
}

export enum MarkState {
  New = 'new',
  Generated = 'generated',
  Modified = 'modified',
  Chosen = 'chosen',
  NotChosen = 'notchosen',
  Deleted = 'deleted',

  Template = 'template',
  Default = 'default'
}

export enum APIState {
  Success = 'Success',
  Sending = 'Sending',
  Fail = 'Fail',
  Default = 'default'
}

export enum TitleState {
  Man = 'Man',
  AI = 'AI'
}

export enum TemplateType {
  MixOne = 'MixOne',
  MixTwo = 'MixTwo',
  OnlyTitles = 'OnlyTitles',
  Blank = 'Blank',
  BlankWithTitle = 'BlankWithTitle',
  None = 'None',
  AI = 'AI'
}

// use for layouts
export type SlideLayout = {
  groupSize: number;
  score?: number;
  bullets: BulletPoint4Layout[];
  media: Media4Layout[]; // remain the media and bullet from same cell at the same group
};

export type LayoutGroup = {
  groupID: number;
  bullets: { num: number; position: Position | undefined };
  media: { mediaID: string; position: Position | undefined }[];
};

export type GroupInfoGL = {
  groupID: number;
  bullets: { num: number; position: GLPosition | undefined };
  media: { mediaID: string; position: GLPosition | undefined }[];
};

export type GroupInfoGLPointOneByOne = {
  groupID: number;
  bullets: { bulletID: string; position: GLPosition | undefined }[];
  media: { mediaID: string; position: GLPosition | undefined }[];
};

export type Position4Group = {
  groupID: number;
  bullets: Position;
  media: { mediaID: string; position: Position | undefined }[];
};

export type BulletPoint = {
  cellID: string;
  bulletID: string;
  bullet: string;
  copy?: string;
  type: SourceType | MarkState;
  weight?: number;

  isChosen: boolean; // since layout will store the info, this may be deleted
  groupID: number; // since layout will store the info, this may be deleted
  groupSize: number; // since layout will store the info, this may be deleted
};

export type BulletPoint4Layout = {
  bulletID: string;
  groupID: number;
  isChosen?: boolean; // used for default choose
};

export type MediaData = {
  cellID: string;
  mediaID: string;
  media: string;
  type: MediaType;
};

export type MediaData4Slide = {
  cellID: string;
  mediaID: string;
  media: string;
  type: MediaType;
  state: MarkState;
};

export type Media4Layout = {
  mediaID: string;
  groupID: number;
  isChosen?: boolean; // used for default choose
};

export enum MediaType {
  Table = 'table',
  Plot = 'plot'
}

export type Position = {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;

  width?: number | string;
  height?: number | string;
};

export type GLPosition = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

// update slide class state
export enum UpdateFromType {
  NewSlide = 'NewSlide',
  ClickFromContent = 'ClickFromContent',
  ClickFromSlide = 'ClickFromSlide',
  DeleteSlide = 'DeleteSlide'
}

// support for styles
export type StyleType = {
  isPageNumOn: boolean;
  isNaviOn: boolean;
  fontSize: number;
};

// control the render of template placeholder
export type TemplateDisplay = {
  id: number;
  show: boolean;
};

// util functions
import axios from 'axios';
import * as _ from 'lodash';
import { observer } from 'mobx-react';
import { svgConfig } from './code-overview';

export const calCodeLineNum = (code: string) => {
  // 临时调整codeoverview中矩形行高
  // let lineHeight = code.split('\n').length * 2;
  // return Math.max(lineHeight, 5);

  let lineNum = code.split('\n').length;
  return Math.max(lineNum, 3);
};

export const calCodeLineHeight = (
  cells: Cell[],
  svgHeight: number,
  gap: number
) => {
  // 计算总行数
  let allLines: number = 0;
  for (let i = 0; i < cells.length; i++) {
    allLines += cells[i].inputLines;
  }
  // console.log('alllines', allLines);

  // 调整codeoverview中矩形行高
  let coh = (svgHeight - gap * cells.length) / allLines;
  for (let i = 0; i < cells.length; i++) {
    // console.log(cells[i].inputLines);
    cells[i].inputLines = Math.round(cells[i].inputLines * coh);
    // console.log(cells[i].inputLines);
  }
};

export const getMedia = (cellIndex: number, outputs: any) => {
  let media: MediaData[] = [];
  if (outputs != undefined) {
    for (let i = 0; i < outputs.length; i++) {
      let item: any = outputs[i];
      // console.log('item', item);
      let outputType = item.output_type;
      // console.log('outputType', outputType);

      if (outputType == 'execute_result') {
        let table = item.data['text/html'];
        // make table border invisible
        table = _.replace(table, 'border="1"', 'border="0"');

        if (table != '') {
          // console.log('table', table);
          let mediaData: MediaData = {
            cellID: 'c-' + cellIndex,
            mediaID: 'm-' + cellIndex + '-' + i,
            media: table,
            type: MediaType.Table
          };
          media.push(mediaData);
        }
      } else if (outputType == 'display_data') {
        let plot = item.data['image/png'];
        plot = 'data:image/png;base64,' + _.trimEnd(plot, '\n');
        let mediaData: MediaData = {
          cellID: 'c-' + cellIndex,
          mediaID: 'm-' + cellIndex + '-' + i,
          media: plot,
          type: MediaType.Plot
        };
        media.push(mediaData);
      } else {
        continue;
      }
    }
  }
  return media;
};

export const convertCells2NBStory = cellsFromNotebook => {
  // get the right format cells used for NBStory
  let cells2NB2Slides: Cell[] = [];

  for (let i = 0; i < cellsFromNotebook.length; i++) {
    let cellTemp = cellsFromNotebook[i];
    let cell: Cell = {
      no: i,
      id: 'none',
      // id is not returned, so it's not used
      // id: cellTemp.id,
      cellType: cellTemp.cell_type,
      isSelected: false,
      relation: undefined,
      bindToSlides: [],
      inputs: cellTemp.source,
      outputs: cellTemp.outputs,

      inputLines: calCodeLineNum(cellTemp.source),
      media: getMedia(i, cellTemp.outputs),

      isChanged: false
    };

    cells2NB2Slides.push(cell);
  }
  // console.log('cells2NB2Slides', cells2NB2Slides);

  // adjust line height to svg height
  let svgHeight = 500;
  if (cells2NB2Slides.length >= 30) svgHeight = 700;
  calCodeLineHeight(cells2NB2Slides, svgHeight, svgConfig.gap);

  return cells2NB2Slides;
};

export const convertSingleCell2NBStory = (cellFromNotebook, no) => {
  let cellTemp = cellFromNotebook;
  let singleCell: Cell = {
    no: no,
    id: cellTemp.id,
    cellType: cellTemp.cell_type,
    isSelected: false,
    relation: undefined,
    bindToSlides: [],
    inputs: cellTemp.source,
    outputs: cellTemp.outputs,

    inputLines: calCodeLineNum(cellTemp.source),
    media: getMedia(no, cellTemp.outputs),

    isChanged: false
  };

  return singleCell;
};

// save data to localStorage
export const saveToLS = (key, value) => {
  console.log('save', key, value);
  if (localStorage) {
    localStorage.setItem(
      'nb',
      JSON.stringify({
        [key]: value
      })
    );
  }
};

export const getFromLS = key => {
  let ls = {};
  if (localStorage) {
    try {
      // ls = localStorage.getItem(key);
      // @ts-ignore
      ls = JSON.parse(localStorage.getItem('nb')) || {};
    } catch (e) {
      console.log(e);
    }
    return ls[key];
  }
};

// get image from Clipboard
export const getImagefromClipboard = evt => {
  let imageData: string = '';

  const clipboardItems = evt.clipboardData.items;
  // Filter the image items only
  const items = _.filter(clipboardItems, o => o.type.indexOf('image') > -1);
  if (items.length > 0) {
    try {
      const item = items[0];
      const blob = item.getAsFile();

      // show image by base64
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target != null) {
          imageData = event.target.result as string;
          console.log('imageData', imageData);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.log(error);
    }
  }

  // the image will not be returned normally because of async
  return imageData;
};

export const insertImageFromClipboard = (
  evt: React.ClipboardEvent,
  medias: MediaData4Slide[],
  glPosition: GLPosition | undefined,
  gridLayouts: GLPosition[]
) => {
  // get image data
  const clipboardItems = evt.clipboardData.items;
  // Filter the image items only
  const items = _.filter(clipboardItems, o => o.type.indexOf('image') > -1);
  if (items.length > 0) {
    try {
      const item = items[0];
      const blob = item.getAsFile();

      // show image by base64
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target != null) {
          const imageData = event.target.result as string;
          // console.log('imageData', imageData);

          // interact with store
          // add new media into store
          let mediaID = 'm-man-' + medias.length;

          if (glPosition != undefined) {
            glPosition.i = mediaID;
            gridLayouts.push(glPosition);
          } else {
            // TODO: update layouts based on the position of mouse
            let leftMost = 12;
            let widthMin = 12;
            let yBottom = 0;
            // 处理没有照片的布局
            let hasMedia = _.findIndex(gridLayouts, o => o.i.indexOf('m') > -1);

            if (hasMedia > -1) {
              gridLayouts.map(item => {
                if (item.i.indexOf('m') > -1) {
                  if (item.x < leftMost) leftMost = item.x;
                  if (item.y > yBottom) yBottom = item.y;
                  if (item.w < widthMin) widthMin = item.w;
                }
              });
            } else {
              gridLayouts.map(item => {
                if (item.x < leftMost) leftMost = item.x;
                if (item.y > yBottom) yBottom = item.y;
                if (item.w < widthMin) widthMin = item.w;
              });
            }

            let newGLLayout: GLPosition = {
              i: mediaID,
              x: leftMost == 12 ? 1 : leftMost,
              y: yBottom + 1,
              w: widthMin > 6 ? 4 : widthMin,
              h: 4
            };
            gridLayouts.push(newGLLayout);
          }

          let newMedia: MediaData4Slide = {
            cellID: 'none',
            mediaID: mediaID,
            media: imageData,
            type: MediaType.Plot,
            state: MarkState.Chosen
          };
          medias.push(newMedia);

          // console.log(
          //   'insertImageFromClipboard',
          //   glPosition,
          //   medias,
          //   gridLayouts
          // );
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.log(error);
    }
  }
};

// get groupinfo from layouts
export const getGroupInfo = (slide: SlideData) => {
  let layoutGroups: GroupInfoGLPointOneByOne[] = [];

  try {
    // layouts[0] will be chosen
    let activeLayout = slide.layouts[0];
    activeLayout.bullets.map(item => {
      let index = _.findIndex(layoutGroups, o => o.groupID == item.groupID);
      if (index > -1) {
        layoutGroups[index].bullets.push({
          bulletID: item.bulletID,
          position: undefined
        });
      } else {
        layoutGroups.push({
          groupID: item.groupID,
          bullets: [
            {
              bulletID: item.bulletID,
              position: undefined
            }
          ],
          media: []
        });
      }
    });

    activeLayout.media.map(item => {
      let index = _.findIndex(layoutGroups, o => o.groupID == item.groupID);
      if (index > -1) {
        layoutGroups[index].media.push({
          mediaID: item.mediaID,
          position: undefined
        });
      } else {
        layoutGroups.push({
          groupID: item.groupID,
          bullets: [],
          media: [
            {
              mediaID: item.mediaID,
              position: undefined
            }
          ]
        });
      }
    });
  } catch (error) {
    console.log(error);
  }

  return layoutGroups;
};

// Get init layouts: base on the group info calcalate the init position
// support for dynamically adjust
export const generateLayout = (slide: SlideData) => {
  // 提炼布局所需的layout
  let glLayout: GLPosition[] = [];

  // 根据组数来布局
  let groupInfo = getGroupInfo(slide);
  // console.log('groupInfo', groupInfo);
  if (groupInfo.length > 0) {
    let flag = true;

    let groupNum = groupInfo.length;
    let bulletBaseY = 0;
    if (groupNum == 1) {
      let group0 = groupInfo[0];
      // only media
      if (group0.bullets.length == 0) {
        switch (group0.media.length) {
          case 0: // 0 media
            console.log('no content to be shown');
            break;
          case 1:
            group0.media[0].position = {
              i: group0.media[0].mediaID,
              x: 3,
              y: 0,
              w: 6,
              h: 6
            };
            break;
          case 2:
            group0.media[0].position = {
              i: group0.media[0].mediaID,
              x: 1,
              y: 0,
              w: 4.5,
              h: 6
            };
            group0.media[1].position = {
              i: group0.media[1].mediaID,
              x: 6,
              y: 0,
              w: 4.5,
              h: 6
            };
            break;
          case 3:
            group0.media[0].position = {
              i: group0.media[0].mediaID,
              x: 1,
              y: 0,
              w: 3,
              h: 6
            };
            group0.media[1].position = {
              i: group0.media[1].mediaID,
              x: 5,
              y: 0,
              w: 3,
              h: 6
            };
            group0.media[2].position = {
              i: group0.media[2].mediaID,
              x: 9,
              y: 0,
              w: 3,
              h: 6
            };
            break;
          default:
            console.log('too many media');
            flag = false;
            break;
        }
      }
      // bullet + media
      else {
        switch (group0.media.length) {
          case 0:
            bulletBaseY = 0;
            group0.bullets.map((bulletItem, index) => {
              bulletItem.position = {
                i: bulletItem.bulletID,
                x: 1,
                y: bulletBaseY + index,
                w: 6,
                h: 1
              };
            });
            break;
          case 1:
            bulletBaseY = 0;
            group0.bullets.map((bulletItem, index) => {
              bulletItem.position = {
                i: bulletItem.bulletID,
                x: 0.5,
                y: bulletBaseY + index,
                w: 7.5,
                h: 1
              };
            });

            group0.media[0].position = {
              i: group0.media[0].mediaID,
              x: 2,
              y: 6,
              w: 8,
              h: 5
            };
            break;
          case 2:
            bulletBaseY = 0;
            group0.bullets.map((bulletItem, index) => {
              bulletItem.position = {
                i: bulletItem.bulletID,
                x: 1,
                y: bulletBaseY + index,
                w: 5.5,
                h: 1
              };
            });

            group0.media[0].position = {
              i: group0.media[0].mediaID,
              x: 7,
              y: 0,
              w: 4,
              h: 6
            };
            group0.media[1].position = {
              i: group0.media[1].mediaID,
              x: 7,
              y: 6,
              w: 4,
              h: 6
            };
            break;
          case 3:
            bulletBaseY = 0;
            group0.bullets.map((bulletItem, index) => {
              bulletItem.position = {
                i: bulletItem.bulletID,
                x: 1,
                y: bulletBaseY + index,
                w: 5.5,
                h: 1
              };
            });

            group0.media[0].position = {
              i: group0.media[0].mediaID,
              x: 7,
              y: 0,
              w: 4,
              h: 4
            };
            group0.media[1].position = {
              i: group0.media[1].mediaID,
              x: 7,
              y: 4,
              w: 4,
              h: 4
            };
            group0.media[2].position = {
              i: group0.media[2].mediaID,
              x: 1,
              y: 8,
              w: 4,
              h: 4
            };
            break;
          default:
            console.log('too many media');
            flag = false;
            break;
        }
      }
    } else if (groupNum == 2) {
      let group0 = groupInfo[0];
      let group1 = groupInfo[1];

      let textBoxNum: number[] = [0, 0];
      let mediaNum: number[] = [0, 0];

      groupInfo.map((group, index) => {
        group.bullets.length > 0 ? (textBoxNum[index] = 1) : '';
        mediaNum[index] = group.media.length;
      });

      // 根据文本框和媒体数量布局
      // only 2 medias
      if (
        textBoxNum[0] == 0 &&
        textBoxNum[1] == 0 &&
        mediaNum[0] == 1 &&
        mediaNum[1] == 1
      ) {
        group0.media[0].position = {
          i: group0.media[0].mediaID,
          x: 1,
          y: 0,
          w: 4,
          h: 6
        };

        group1.media[0].position = {
          i: group1.media[0].mediaID,
          x: 6,
          y: 0,
          w: 4,
          h: 6
        };
      } else {
        // media and text
        if (mediaNum[0] <= 1 && mediaNum[1] <= 1) {
          bulletBaseY = 0;
          group0.bullets.map((bulletItem, index) => {
            bulletItem.position = {
              i: bulletItem.bulletID,
              x: 1,
              y: bulletBaseY + index,
              w: 5.5,
              h: 1
            };
          });
          group0.media.length > 0
            ? (group0.media[0].position = {
                i: group0.media[0].mediaID,
                x: 7,
                y: 0,
                w: 4,
                h: 6
              })
            : '';

          bulletBaseY = 6;
          group1.bullets.map((bulletItem, index) => {
            bulletItem.position = {
              i: bulletItem.bulletID,
              x: 1,
              y: bulletBaseY + index,
              w: 5.5,
              h: 1
            };
          });
          group1.media.length > 0
            ? (group1.media[0].position = {
                i: group1.media[0].mediaID,
                x: 7,
                y: 7,
                w: 4,
                h: 6
              })
            : '';
        } else {
          flag = false;
        }
      }
    } else if (groupNum == 3) {
      let group0 = groupInfo[0];
      let group1 = groupInfo[1];
      let group2 = groupInfo[2];

      if (
        group0.media.length <= 1 &&
        group1.media.length <= 1 &&
        group2.media.length <= 1
      ) {
        bulletBaseY = 0;
        group0.bullets.map((bulletItem, index) => {
          bulletItem.position = {
            i: bulletItem.bulletID,
            x: 0,
            y: bulletBaseY,
            w: 3.5,
            h: 2
          };
          bulletBaseY += 2;
        });
        group0.media.length > 0
          ? (group0.media[0].position = {
              i: group0.media[0].mediaID,
              x: 0,
              y: 6,
              w: 3.5,
              h: 4
            })
          : '';

        bulletBaseY = 0;
        group1.bullets.map((bulletItem, index) => {
          bulletItem.position = {
            i: bulletItem.bulletID,
            x: 4,
            y: bulletBaseY,
            w: 3.5,
            h: 2
          };
          bulletBaseY += 2;
        });
        group1.media.length > 0
          ? (group1.media[0].position = {
              i: group1.media[0].mediaID,
              x: 4,
              y: 6,
              w: 3.5,
              h: 4
            })
          : '';

        bulletBaseY = 0;
        group2.bullets.map((bulletItem, index) => {
          bulletItem.position = {
            i: bulletItem.bulletID,
            x: 8,
            y: bulletBaseY,
            w: 3.5,
            h: 2
          };
          bulletBaseY += 2;
        });
        group2.media.length > 0
          ? (group2.media[0].position = {
              i: group2.media[0].mediaID,
              x: 8,
              y: 6,
              w: 3.5,
              h: 4
            })
          : '';
      } else {
        flag = false;
      }
    } else {
      console.log('more than 3 groups');
      flag = false;
    }

    if (flag == false) {
      let bulletBaseY = 0;
      let mediaBaseY = 0;
      groupInfo.map(group => {
        group.bullets.map(bullet => {
          bullet.position = {
            i: bullet.bulletID,
            x: 1,
            y: bulletBaseY,
            w: 6,
            h: 1
          };
          bulletBaseY += 1;
        });

        group.media.map(media => {
          media.position = {
            i: media.mediaID,
            x: 7.5,
            y: mediaBaseY,
            w: 3.5,
            h: 4
          };
          mediaBaseY += 4;
        });
      });
    }

    groupInfo.map(item => {
      item.bullets.map(bulletItem => {
        if (bulletItem.position != undefined)
          glLayout.push(bulletItem.position);
      });
      item.media.map(mediaItem => {
        if (mediaItem.position != undefined) glLayout.push(mediaItem.position);
      });
    });
  }

  // make sure the system will always return a layout
  if (glLayout.length == 0) {
    console.log('generate init layout by bullets and media in layouts');

    let activeLayout = slide.layouts[0];
    let bulletBaseY = 0;
    let mediaBaseY = 0;
    activeLayout.bullets.map(bullet => {
      let tempPos = {
        i: bullet.bulletID,
        x: 1,
        y: bulletBaseY,
        w: 5.5,
        h: 1
      };
      glLayout.push(tempPos);

      bulletBaseY += 1;
    });
    activeLayout.media.map(media => {
      let tempPos = {
        i: media.mediaID,
        x: 7,
        y: mediaBaseY,
        w: 4,
        h: 4
      };
      glLayout.push(tempPos);

      mediaBaseY += 4;
    });
  }

  console.log('generateLayout', glLayout);

  return glLayout;
};

// GetMeida: 根据当前选中的cell提取media信息
export const getMedias4SelectedCells = (slide: SlideData, cells: Cell[]) => {
  let medias: MediaData4Slide[] = [];

  slide.connectedCells.map(no => {
    let index = _.findIndex(cells, cell => cell.no == no);

    if (index > -1) {
      let cell = cells[index];
      if (cell.media != undefined && cell.media?.length > 0) {
        cell.media.map(item => {
          // Table列数太多了 暂时不处理
          // if (item.type != MediaType.Table) {
          medias.push({
            cellID: item.cellID,
            mediaID: item.mediaID,
            media: item.media,
            type: item.type,
            state: MarkState.Chosen
          });
          // }
        });
      }
    }
  });

  return medias;
};

// url base
// export const URLBase: string = 'http://127.0.0.1:5000';
export const URLBase: string = 'http://34.123.183.29:3000';

export async function getDataByAxios(url, data, method) {
  // console.log('getDataByAxios parameters', url, data, method);

  const result = await axios({
    url: url,
    method: method,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    },
    data: data
  });

  console.log('getDataByAxios result', result.data);
  return result.data;
}

export async function postData(url = '', data = {}) {
  console.log('postData', url, data);

  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'no-cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  console.log('response', response);
  return response; // parses JSON response into native JavaScript objects
}

// do with API
export const convertCells2TBLAPI = (cells: Cell[]) => {
  let cells4back: Cell4Backend[] = [];

  cells.map(cell => {
    let medias: {
      cellID?: string;
      mediaID: string;
      type: MediaType;
      isChosen: boolean;
    }[] = [];
    cell.media?.map(item => {
      medias.push({
        cellID: item.cellID,
        mediaID: item.mediaID,
        type: item.type,
        isChosen: true
      });
    });

    let cellType = '';
    if (cell.cellType == 'code') cellType = 'Code';
    else if (cell.cellType == 'markdown') cellType = 'Markdown';

    cells4back.push({
      cellID: 'c-' + cell.no,
      id: cell.id,
      order: cell.no,
      cellType: cellType,
      source: cell.inputs,
      outputs: cell.outputs,
      media: medias,
      maxGroup: 1
    });
  });

  return cells4back;
};

export const convertCells2RelevantAPI = (cells: Cell[]) => {
  let cells4back: Cell4Backend[] = [];

  cells.map(cell => {
    let cellType = '';
    if (cell.cellType == 'code') cellType = 'Code';
    else if (cell.cellType == 'markdown') cellType = 'Markdown';

    cells4back.push({
      cellID: 'c-' + cell.no,
      cellType: cellType,
      isChosen: true,
      source: cell.inputs,
      outputs: cell.outputs
    });
  });

  return cells4back;
};

export const convertPointsFromBE = (points: any[]) => {
  let points2nb: BulletPoint[] = [];

  points.map(item => {
    let temp = {
      cellID: item.cellID,
      bulletID: item.bullet_ID,
      bullet: item.bullet,
      copy: item.bullet,
      type: SourceType.Code,
      weight: item.weight,

      isChosen: true,
      groupID: 1,
      groupSize: 1
    };

    points2nb.push(temp);
  });

  // adjust for record
  // if (points2nb.length > 0)
  //   points2nb[0].bullet =
  //     'Load data from house-prices-advanced-regression-technices';

  // let tempFix = {
  //   cellID: 'c-6',
  //   bulletID: 'b-6-1',
  //   bullet: 'The data has a train size 1460 x 81 and a test size 1459 x 80',
  //   copy: 'The data has a train size 1460 x 81 and a test size 1459 x 80',
  //   type: SourceType.Code,
  //   weight: 10,

  //   isChosen: true,
  //   groupID: 1,
  //   groupSize: 1
  // };

  // points2nb.push(tempFix);

  // let tempFix1 = {
  //   cellID: 'c-6',
  //   bulletID: 'b-6-1',
  //   bullet: 'train size: 1460 x 81',
  //   copy: 'train size: 1460 x 81',
  //   type: SourceType.Code,
  //   weight: 10,

  //   isChosen: true,
  //   groupID: 1,
  //   groupSize: 1
  // };

  // points2nb.push(tempFix1);

  // let tempFix2 = {
  //   cellID: 'c-6',
  //   bulletID: 'b-6-2',
  //   bullet: 'test size: 1459 x 80',
  //   copy: 'test size: 1459 x 80',
  //   type: SourceType.Code,
  //   weight: 10,

  //   isChosen: true,
  //   groupID: 1,
  //   groupSize: 1
  // };

  // points2nb.push(tempFix2);

  console.log('points2nb', points2nb);
  return points2nb;
};

export const convertLayoutsFromBE = (
  layouts: any[],
  points2nb: BulletPoint[]
) => {
  let layouts2nb: SlideLayout[] = [];

  try {
    layouts.map(item => {
      let pointsGroupInfo = item.bullets;

      let bullets: BulletPoint4Layout[] = [];
      points2nb.map(o => {
        let groupIDIndex = _.findIndex(
          pointsGroupInfo,
          info => info.bullets[2] == o.bulletID[2]
        );

        let groupID = 0;
        if (groupIDIndex > -1) groupID = pointsGroupInfo[groupIDIndex].groupID;

        let temp: BulletPoint4Layout = {
          bulletID: o.bulletID,
          groupID: groupID,
          isChosen: true
        };

        bullets.push(temp);
      });

      let medias: Media4Layout[] = [];
      item.media.map(m => {
        let media: Media4Layout = {
          mediaID: m.mediaID,
          groupID: m.groupID,
          isChosen: true
        };

        medias.push(media);
      });

      let temp = {
        groupSize: item.group_size,
        score: 0.8,
        bullets: bullets,
        media: medias
      };

      layouts2nb.push(temp);
    });

    console.log('layouts2nb', layouts2nb);
  } catch (error) {
    console.log(error);
  }
  return layouts2nb;
};

export const convertLayoutsFromBEV2 = (
  layouts: any[],
  points2nb: BulletPoint[]
) => {
  let layouts2nb: SlideLayout[] = [];

  try {
    let pointsBack: any[] = [];
    let medias: Media4Layout[] = [];
    console.log('convertLayoutsFromBEV2', layouts);

    if (layouts.length > 1) {
      layouts.map((item, index) => {
        console.log('convertLayoutsFromBEV2', item, index);

        item.bullets.map(p => {
          let point = {
            cellID: p.cellID,
            bullets: p.bullets,
            groupID: index
          };
          pointsBack.push(point);
        });

        item.media.map(m => {
          let media: Media4Layout = {
            mediaID: m.mediaID,
            groupID: index,
            isChosen: true
          };
          medias.push(media);
        });
      });
    } else {
      layouts[0].bullets.map(p => {
        let point = {
          cellID: p.cellID,
          bullets: p.bullets,
          groupID: p.groupID
        };
        pointsBack.push(point);
      });

      layouts[0].media.map(m => {
        let media: Media4Layout = {
          mediaID: m.mediaID,
          groupID: m.groupID,
          isChosen: true
        };
        medias.push(media);
      });
    }

    // console.log('pointsBack', pointsBack);
    // console.log('medias', medias);

    let bullets: BulletPoint4Layout[] = [];
    points2nb.map(pn => {
      let groupIDIndex = _.findIndex(pointsBack, pb => {
        let pnSplits = _.split(pn.bulletID, '-');
        let pnID = '0';
        if (pnSplits.length >= 2) {
          pnID = pnSplits[1];
        }
        let pbID = pb.bullets.substring(2);

        return pnID == pbID;
      });

      let groupID = 0;
      if (groupIDIndex > -1) {
        groupID = pointsBack[groupIDIndex].groupID;
        // console.log('groupID', groupID);
      }

      let temp: BulletPoint4Layout = {
        bulletID: pn.bulletID,
        groupID: groupID,
        isChosen: true
      };

      bullets.push(temp);
    });

    let tempLayout = {
      groupSize: layouts.length,
      score: 0.8,
      bullets: bullets,
      media: medias
    };
    layouts2nb.push(tempLayout);

    console.log('layouts2nb', layouts2nb);
  } catch (error) {
    console.log(error);
  }
  return layouts2nb;
};

// jupm in react
const scrollToRef = ref => window.scrollTo(0, ref.current.offsetTop);
