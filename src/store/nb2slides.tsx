import React from 'react';
import {
  makeAutoObservable,
  makeObservable,
  observable,
  computed,
  autorun,
  action,
  intercept
} from 'mobx';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import type { DataNode } from 'antd/es/tree';

import {
  Cell,
  CellRelation,
  SlideMeta,
  SlideData,
  Contraint,
  Title,
  BulletPoint,
  SourceType,
  MarkState,
  SlideTag,
  DropDownItem,
  ContentUnit,
  UpdateFromType,
  MediaType,
  calCodeLineNum,
  getMedia,
  StyleType,
  TemplateType,
  TitleState,
  saveToLS,
  URLBase,
  getDataByAxios,
  convertCells2RelevantAPI,
  convertCells2TBLAPI,
  APIState
} from '../util';
import { slideTemplateBase } from '../slide-templates';
import axios from 'axios';

// 对应用状态进行建模
export class NB2SlidesStore {
  activeCell: any = {};
  cells: Cell[] = [];
  cellsRelation: CellRelation[] = [];

  metadata: SlideMeta = { title: '', author: '', theme: 'light' };
  slides: SlideData[] = [];
  tags: SlideTag[] = [
    { tag: 'Introduction', type: SourceType.Template },
    { tag: 'Data', type: SourceType.Template },
    { tag: 'Model', type: SourceType.Template },
    { tag: 'Model Performance', type: SourceType.Template },
    { tag: 'Conclusion', type: SourceType.Template }
  ];
  currentSlideNo: number = 0;
  isCellNumberChange4CurrentSlide: boolean = false;

  style: StyleType = { isNaviOn: false, isPageNumOn: true, fontSize: 15 };

  constructor() {
    // make attrs and computed attrs auto observable
    makeAutoObservable(this);
    autorun(() => {
      // console.log('NB2SlidesStore autorun');
      // this.setFirstSlide();
      // init slides for test
      // this.setInitialSlides();
      // update when cells change
      // this.setCellsRelation();
      // update cellstate when active cell is changed
      // this.updateCellData();
      // update when tags are changed
      // this.updateTags();
      // update when selected cells are changed
      // this.updateSlideTitles();
      // update when current slide number is changed
      // this.updateCurrentSlideNo();
      // console.log('cells', this.cells);
      // console.log('currentSelectCells', this.currentSelectCells);
      // console.log('currentSlide', this.currentSlide);
      // console.log('cellsRelation', this.cellsRelation);
      // console.log('slides', this.slides);
      // console.log('contentsStructure', this.contentsStructure);
      // console.log('metadata', this.metadata);
    });
  }

  // computed
  get contentLinksV2(): ContentUnit[] {
    const slides: SlideData[] = this.slides;

    const contentsStructure: ContentUnit[] = [];
    for (let i = 0; i < slides.length; i++) {
      let slideTemp = slides[i];

      if (
        slideTemp.tag != '' &&
        slideTemp.title.title != '' &&
        slideTemp.state != MarkState.Deleted
      ) {
        let slideID = slideTemp.id;
        let tag = slideTemp.tag;
        let title = slideTemp.title.title;

        let isTagNew = _.findIndex(contentsStructure, o => o.tag == tag);
        if (isTagNew < 0) {
          // new
          contentsStructure.push({
            tag: tag,
            titles: [
              {
                title: title,
                id: slideID,
                index: i
              }
            ]
          });
        } else {
          // old
          contentsStructure[isTagNew].titles.push({
            title: title,
            id: slideID,
            index: i
          });
        }
      }
    }

    return contentsStructure;
  }

  get currentSlide(): SlideData {
    try {
      if (this.slides.length >= this.currentSlideNo)
        return this.slides[this.currentSlideNo];
      else return this.slides?.[0];
    } catch (error) {
      console.log(error);
      return this.slides?.[0];
    }
  }

  get currentTags4Selection() {
    let tags = this.tags;

    let temp: DropDownItem[] = [];
    for (let i = 0; i < tags.length; i++) {
      temp.push({
        label: tags[i].tag,
        key: '' + i
      });
    }

    // not supported
    // add divider
    // temp.push({ type: 'divider' });
    // temp.push({
    //   label: 'add one tag',
    //   key: '+ one tag'
    // });

    return temp;
  }

  get isCellContentChanged4CurrentSlide(): boolean {
    let flag: boolean = false;
    let connectedCells = this.currentSlide.connectedCells;

    // 监听内容变化
    for (let i = 0; i < connectedCells.length; i++) {
      let no = connectedCells[i];
      let index = _.findIndex(this.cells, o => o.no == no);
      if (index > -1) {
        if (this.cells[index].isChanged) {
          flag = true;
          break;
        }
      }
    }

    return flag;
  }

  // get currentAnchor(): string {
  //   try {
  //     let anchor = '#' + this.currentSlide.id;
  //     console.log('anchor', anchor);
  //     return anchor;
  //   } catch (error) {
  //     console.log(error);
  //     return '#';
  //   }
  // }

  // action
  setFirstSlide() {
    // 添加首页的slide，便于用户添加报告题目和作者信息
    const slideID = 'slide-0';
    const firstSlide: SlideData = slideTemplateBase(slideID);
    firstSlide.templateType = TemplateType.OnlyTitles;
    firstSlide.templateDisplay.push({ id: 1, show: true });
    firstSlide.templateDisplay.push({ id: 2, show: true });

    if (this.slides.length == 0) this.slides.push(firstSlide);

    // console.log('setFirstSlide', this.slides);
  }

  setInitialSlides() {
    // console.log('setInitialSlides', this.slides);

    // 2. 设置临时slides，构建页面
    let slide1: SlideData = {
      active: true,
      id: 'slide-0',

      connectedCells: [4, 5, 6],
      constraint: { audienceLevel: 1, detailLevel: 2, autoMerge: false },

      tag: 'Tag1',
      title: {
        title: 'slide a',
        state: TitleState.Man,
        original: '',
        apiState: APIState.Default
      },
      titles: [
        {
          title: 'slide a',
          type: SourceType.Man,
          weight: 10,
          isChosen: true
        },
        {
          title: 'slide b',
          type: SourceType.Code,
          weight: 1,
          isChosen: false
        },
        {
          title: 'slide c',
          type: SourceType.Markdown,
          weight: 20,
          isChosen: false
        }
      ],
      bulletPoints: [
        {
          cellID: 'c-4',
          bulletID: 'b-4-0',
          bullet: 'A is more important code.',
          type: SourceType.Code,
          weight: 10,
          isChosen: true,
          groupID: 1,
          groupSize: 1
        },
        {
          cellID: 'c-5',
          bulletID: 'b-5-0',
          bullet: 'B is less important code.',
          type: SourceType.Code,
          weight: 1,
          isChosen: false,
          groupID: 1,
          groupSize: 1
        },
        {
          cellID: 'c-6',
          bulletID: 'b-6-0',
          bullet: 'C is important markdown.',
          type: SourceType.Markdown,
          weight: 20,
          isChosen: true,
          groupID: 1,
          groupSize: 1
        }
      ],
      medias: [
        {
          cellID: 'c-4',
          mediaID: 'm-4-0',
          media:
            '<div>\n<style scoped>\n    .dataframe tbody tr th:only-of-type {\n        vertical-align: middle;\n    }\n\n    .dataframe tbody tr th {\n        vertical-align: top;\n    }\n\n    .dataframe thead th {\n        text-align: right;\n    }\n</style>\n<table border="0" class="dataframe">\n  <thead>\n    <tr style="text-align: right;">\n      <th></th>\n      <th>group</th>\n      <th>variable</th>\n      <th>value</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th>0</th>\n      <td>A</td>\n      <td>v1</td>\n      <td>30</td>\n    </tr>\n    <tr>\n      <th>1</th>\n      <td>A</td>\n      <td>v2</td>\n      <td>95</td>\n    </tr>\n    <tr>\n      <th>2</th>\n      <td>A</td>\n      <td>v3</td>\n      <td>22</td>\n    </tr>\n    <tr>\n      <th>3</th>\n      <td>A</td>\n      <td>v4</td>\n      <td>14</td>\n    </tr>\n    <tr>\n      <th>4</th>\n      <td>A</td>\n      <td>v5</td>\n      <td>59</td>\n    </tr>\n  </tbody>\n</table>\n</div>',
          type: MediaType.Table,
          state: MarkState.Chosen
        },
        {
          cellID: 'c-5',
          mediaID: 'm-5-0',
          media:
            'data:image/png;base64,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',
          type: MediaType.Plot,
          state: MarkState.Chosen
        }
      ],

      groupSize: 1,
      activeLayoutIndex: 0,
      layouts: [
        {
          groupSize: 1,
          score: 0.8,
          bullets: [
            {
              bulletID: 'b-4-0',
              isChosen: true,
              groupID: 1
            },
            {
              bulletID: 'b-5-0',
              isChosen: true,
              groupID: 1
            },
            {
              bulletID: 'b-6-0',
              isChosen: false,
              groupID: 1
            }
          ],
          media: [
            { mediaID: 'm-4-0', isChosen: false, groupID: 1 },
            { mediaID: 'm-5-0', isChosen: true, groupID: 1 }
          ]
        },
        {
          groupSize: 3,
          score: 0.6,
          bullets: [
            {
              bulletID: 'b-4-0',
              isChosen: true,
              groupID: 1
            },
            {
              bulletID: 'b-5-0',
              isChosen: true,
              groupID: 2
            },
            {
              bulletID: 'b-6-0',
              isChosen: true,
              groupID: 3
            }
          ],
          media: [
            { mediaID: 'm-4-0', isChosen: true, groupID: 1 },
            { mediaID: 'm-5-0', isChosen: true, groupID: 2 }
          ]
        }
      ],
      gridLayouts: [
        {
          w: 3,
          h: 1,
          x: 1,
          y: 0,
          i: 'b-4-0'
        },
        {
          w: 3,
          h: 1,
          x: 1,
          y: 1,
          i: 'b-5-0'
        },
        {
          w: 3,
          h: 1,
          x: 1,
          y: 2,
          i: 'b-6-0'
        },
        {
          w: 4,
          h: 6,
          x: 6,
          y: 0,
          i: 'm-4-0'
        },
        {
          w: 4,
          h: 6,
          x: 6,
          y: 6,
          i: 'm-5-0'
        }
      ],
      gridLayoutsRecord: {
        layout: [
          {
            w: 3,
            h: 1,
            x: 1,
            y: 0,
            i: 'b-4-0'
          },
          {
            w: 3,
            h: 1,
            x: 1,
            y: 1,
            i: 'b-5-0'
          },
          {
            w: 3,
            h: 1,
            x: 1,
            y: 2,
            i: 'b-6-0'
          },
          {
            w: 4,
            h: 6,
            x: 6,
            y: 0,
            i: 'm-4-0'
          },
          {
            w: 4,
            h: 6,
            x: 6,
            y: 6,
            i: 'm-5-0'
          }
        ],
        adjustCount: 0
      },
      navis: [],

      state: MarkState.Generated,
      templateType: TemplateType.AI,
      templateDisplay: [],
      comment: '',

      apiState: APIState.Default
    };
    let slide2: SlideData = {
      active: false,
      id: 'slide-1',

      connectedCells: [1, 2, 3],
      constraint: { audienceLevel: 1, detailLevel: 2, autoMerge: false },

      tag: 'Tag2',
      title: {
        title: 'slide b',
        state: TitleState.Man,
        original: '',
        apiState: APIState.Default
      },
      titles: [
        {
          title: 'slide a',
          type: SourceType.Man,
          weight: 10,
          isChosen: false
        },
        {
          title: 'slide b',
          type: SourceType.Code,
          weight: 1,
          isChosen: true
        },
        {
          title: 'slide c',
          type: SourceType.Markdown,
          weight: 20,
          isChosen: false
        }
      ],
      bulletPoints: [
        {
          cellID: 'c-4',
          bulletID: 'b-4-0',
          bullet: 'A is more important code.',
          type: SourceType.Code,
          weight: 10,
          isChosen: true,
          groupID: 1,
          groupSize: 1
        },
        {
          cellID: 'c-5',
          bulletID: 'b-5-0',
          bullet: 'B is less important code.',
          type: SourceType.Code,
          weight: 1,
          isChosen: false,
          groupID: 1,
          groupSize: 1
        },
        {
          cellID: 'c-6',
          bulletID: 'b-6-0',
          bullet: 'C is important markdown.',
          type: SourceType.Markdown,
          weight: 20,
          isChosen: true,
          groupID: 1,
          groupSize: 1
        }
      ],
      medias: [
        {
          cellID: 'c-4',
          mediaID: 'm-4-0',
          media:
            '<div>\n<style scoped>\n    .dataframe tbody tr th:only-of-type {\n        vertical-align: middle;\n    }\n\n    .dataframe tbody tr th {\n        vertical-align: top;\n    }\n\n    .dataframe thead th {\n        text-align: right;\n    }\n</style>\n<table border="0" class="dataframe">\n  <thead>\n    <tr style="text-align: right;">\n      <th></th>\n      <th>group</th>\n      <th>variable</th>\n      <th>value</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <th>0</th>\n      <td>A</td>\n      <td>v1</td>\n      <td>30</td>\n    </tr>\n    <tr>\n      <th>1</th>\n      <td>A</td>\n      <td>v2</td>\n      <td>95</td>\n    </tr>\n    <tr>\n      <th>2</th>\n      <td>A</td>\n      <td>v3</td>\n      <td>22</td>\n    </tr>\n    <tr>\n      <th>3</th>\n      <td>A</td>\n      <td>v4</td>\n      <td>14</td>\n    </tr>\n    <tr>\n      <th>4</th>\n      <td>A</td>\n      <td>v5</td>\n      <td>59</td>\n    </tr>\n  </tbody>\n</table>\n</div>',
          type: MediaType.Table,
          state: MarkState.Chosen
        },
        {
          cellID: 'c-5',
          mediaID: 'm-5-0',
          media:
            'data:image/png;base64,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',
          type: MediaType.Plot,
          state: MarkState.Chosen
        }
      ],

      groupSize: 1,
      activeLayoutIndex: 1,
      layouts: [
        {
          groupSize: 1,
          score: 0.8,
          bullets: [
            {
              bulletID: 'b-4-0',
              isChosen: true,
              groupID: 1
            },
            {
              bulletID: 'b-5-0',
              isChosen: true,
              groupID: 1
            },
            {
              bulletID: 'b-6-0',
              isChosen: false,
              groupID: 1
            }
          ],
          media: [
            { mediaID: 'm-4-0', isChosen: true, groupID: 1 },
            { mediaID: 'm-5-0', isChosen: false, groupID: 1 }
          ]
        },
        {
          groupSize: 3,
          score: 0.6,
          bullets: [
            {
              bulletID: 'b-4-0',
              isChosen: true,
              groupID: 1
            },
            {
              bulletID: 'b-5-0',
              isChosen: true,
              groupID: 2
            },
            {
              bulletID: 'b-6-0',
              isChosen: true,
              groupID: 3
            }
          ],
          media: [
            { mediaID: 'm-4-0', isChosen: true, groupID: 1 },
            { mediaID: 'm-5-0', isChosen: true, groupID: 2 }
          ]
        }
      ],
      gridLayouts: [
        {
          w: 3,
          h: 1,
          x: 1,
          y: 0,
          i: 'b-4-0'
        },
        {
          w: 3,
          h: 1,
          x: 1,
          y: 1,
          i: 'b-5-0'
        },
        {
          w: 3,
          h: 1,
          x: 1,
          y: 2,
          i: 'b-6-0'
        },
        {
          w: 4,
          h: 6,
          x: 6,
          y: 0,
          i: 'm-4-0'
        },
        {
          w: 4,
          h: 6,
          x: 6,
          y: 6,
          i: 'm-5-0'
        }
      ],
      gridLayoutsRecord: {
        layout: [
          {
            w: 3,
            h: 1,
            x: 1,
            y: 0,
            i: 'b-4-0'
          },
          {
            w: 3,
            h: 1,
            x: 1,
            y: 1,
            i: 'b-5-0'
          },
          {
            w: 3,
            h: 1,
            x: 1,
            y: 2,
            i: 'b-6-0'
          },
          {
            w: 4,
            h: 6,
            x: 6,
            y: 0,
            i: 'm-4-0'
          },
          {
            w: 4,
            h: 6,
            x: 6,
            y: 6,
            i: 'm-5-0'
          }
        ],
        adjustCount: 0
      },
      navis: [],

      state: MarkState.Generated,
      templateType: TemplateType.AI,
      templateDisplay: [],
      comment: '',

      apiState: APIState.Default
    };

    if (this.slides.length < 3) {
      this.slides.push(slide1);
      this.slides.push(slide2);
    }
  }

  setCellsRelation() {
    // 计算所有cell间的相关性

    // 构建API数据
    const cellsTemp = _.filter(this.cells, o => _.trim(o.inputs) != '');
    const cells4Back = convertCells2RelevantAPI(cellsTemp);

    // 调用API，接收返回的数据(cellsRelation)并处理成需要的形式
    const url = URLBase + '/submit_payload_relevance';
    console.log('setCellsRelation url', url);
    const data = JSON.parse(JSON.stringify(cells4Back));
    // const data = JSON.stringify([
    //   {
    //     cellID: 'c-0',
    //     cellType: 'Code',
    //     isChosen: true,
    //     source:
    //       'from sklearn.linear_model import LogisticRegression\nlog_clf = LogisticRegression(max_iter = 1000, random_state = 4)\nlog_clf.fit(x_train, y_train)\nlog_score = log_clf.score(x_test, y_test)\nlog_score',
    //     outputs: [
    //       {
    //         name: 'stdout',
    //         text: 'FF\nFF\n',
    //         output_type: 'stream'
    //       }
    //     ]
    //   },
    //   {
    //     cellID: 'c-1',
    //     cellType: 'Code',
    //     isChosen: false,
    //     source:
    //       "log_grid = {'C': np.logspace(-4, 4),'solver': ['liblinear'], 'max_iter': np.arange(100, 2000, 100),'penalty':['l1', 'l2']}\nlog_gscv = GridSearchCV(LogisticRegression(max_iter = 1000, random_state = 7),param_grid=log_grid,cv=5,verbose=true)\nlog_gscv.fit(x_train, y_train)\nlog_tuned_score = log_gscv.score(x_test, y_test)\nlog_tuned_score",
    //     outputs: [
    //       {
    //         name: 'stdout',
    //         text: 'FF\nFF\n',
    //         output_type: 'stream'
    //       }
    //     ]
    //   }
    // ]);
    console.log('setCellsRelation data', data);
    // const result = getDataByAxios(url, data, 'POST');
    // console.log('setCellsRelation result', result);

    try {
      axios({
        url: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        },
        data: data
      })
        .then(res => {
          console.log('setCellsRelation res', res);

          // may need to change the results format of API
          let result: any[] = res.data;
          let cellsRelation: CellRelation[] = [];
          result.map(item => {
            if (item.weight > 0) {
              cellsRelation.push({
                source: parseInt(item.source.substring(2)),
                target: parseInt(item.target.substring(2)),
                weight: item.weight
              });
            }
          });

          // 排序取前20%或20条
          // cellsRelation = _.orderBy(cellsRelation, ['weight'], ['desc']);

          // 过滤weight>0.5 && o.weight != 1
          cellsRelation = _.filter(
            cellsRelation,
            o => o.weight >= 0.6 && o.weight != 1
          );
          console.log('cellsRelation', cellsRelation);

          this.cellsRelation = cellsRelation;
        })
        .catch(err => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }

    // let cellsRelation = [
    //   { source: 0, target: 1, weight: 10 },
    //   { source: 0, target: 2, weight: 3 },
    //   { source: 0, target: 4, weight: 6 },
    //   { source: 1, target: 2, weight: 2 },
    //   { source: 1, target: 6, weight: 1 },
    //   { source: 2, target: 3, weight: 15 },
    //   { source: 3, target: 5, weight: 3 }
    // ];
  }

  updateCurrentSlideNo(source, slideIDOrIndex) {
    // console.log('updateCurrentSlideNo', source, slideID);
    // 恢复cellnum标记, 表示当前slide的cell数目没有变化
    this.isCellNumberChange4CurrentSlide = false;

    // 更新操作的slide
    if (source == UpdateFromType.NewSlide) {
      if (this.currentSlideNo != this.slides.length - 1)
        this.currentSlideNo = this.slides.length - 1;
    } else if (
      source == UpdateFromType.ClickFromContent ||
      source == UpdateFromType.ClickFromSlide
    ) {
      try {
        let id = slideIDOrIndex;
        let index = _.findIndex(this.slides, o => o.id == id);
        if (index > -1) {
          if (this.currentSlideNo != index) this.currentSlideNo = index;
        }
      } catch (error) {
        console.log(error);
      }
    } else if (source == UpdateFromType.DeleteSlide) {
      try {
        let index = slideIDOrIndex;
        if (index == this.slides.length - 1) {
          this.currentSlideNo = this.slides.length - 2;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  updateSlideTitles() {
    // post currentSlide.connectedCells to backend to get titles
    try {
      // 构建API数据
      // 获取对应的cell数据
      const cellsTemp = _.filter(this.cells, o => {
        if (_.trim(o.inputs) != '') {
          let index = _.indexOf(this.currentSlide.connectedCells, o.no);
          if (index > -1) return true;
          else return false;
        } else return false;
      });
      const cells4Back = convertCells2TBLAPI(cellsTemp);

      // 调用API，接收返回的数据(titles)并处理成需要的形式
      const url = URLBase + '/submit_payload_title';
      console.log('updateSlideTitles url', url);
      // const data = JSON.parse(JSON.stringify(cells4Back));
      // console.log('updateSlideTitles data', data);

      const dataV2 = JSON.parse(
        JSON.stringify({ topic: this.currentSlide.tag, cells: cells4Back })
      );
      console.log('updateSlideTitles dataV2', dataV2);
      // const result = getDataByAxios(url, data, 'POST');

      axios({
        url: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        },
        // data: data
        data: dataV2
      })
        .then(res => {
          console.log('updateSlideTitles res', res);

          let result: any[] = res.data;
          let titles: Title[] = [];
          result.map((item, index) => {
            // skip the model info now, may recover later
            let temp: Title = {
              title: _.startCase(item.title),
              type:
                item.type == 'Markdown' ? SourceType.Markdown : SourceType.Code,
              weight: item.weight,
              model: item.model,
              isChosen: item.isChosen
            };

            // adjust for the record
            // if (index == 2) temp.title = 'Understand the Problem';
            // else if (index == 3) temp.title = 'Load the Data';

            titles.push(temp);
          });

          console.log('updateSlideTitles titles', titles);
          this.currentSlide.titles = titles;

          // 默认选择title
          if (titles.length > 0 && this.currentSlide.title.title == '') {
            this.currentSlide.title.apiState = APIState.Success;
            this.currentSlide.title.title = titles[0].title;
            this.currentSlide.title.original = titles[0].title;
            this.currentSlide.title.state = TitleState.AI;
          }

          // adjust for the record
          // 默认选择title
          // if (titles.length > 0 && this.currentSlide.title.title == '') {
          //   this.currentSlide.title.apiState = APIState.Success;
          //   this.currentSlide.title.title = titles[2].title;
          //   this.currentSlide.title.original = titles[2].title;
          //   this.currentSlide.title.state = TitleState.AI;
          // }
        })
        .catch(err => {
          console.log(err);
        });

      // let titles = [
      //   {
      //     title: 'updateSlideTitle 1',
      //     type: SourceType.Code,
      //     weight: 10,
      //     isChosen: true
      //   },
      //   {
      //     title: 'updateSlideTitle 2',
      //     type: SourceType.Code,
      //     weight: 10,
      //     isChosen: false
      //   }
      // ];
    } catch (error) {
      console.log(error);
    }
  }

  // updateTags() {
  //   this.slides.map(slide => {
  //     let index = _.findIndex(this.tags, o => o.tag == slide.tag);

  //     if (index == -1) {
  //       this.tags.push({ tag: slide.tag, type: SourceType.Man });
  //     }
  //   });
  // }

  updateCellData(activeCell, activeCellIndex) {
    let index = _.findIndex(this.cells, o => o.no == activeCellIndex);
    // console.log('updateCellData', activeCell, index);

    if (index > -1) {
      let cellChanged = this.cells[index];

      // 更新active cell
      this.activeCell = cellChanged;
      // console.log('updateCellData', this.activeCell);

      if (activeCell.source != cellChanged.inputs) {
        console.log('CellData is changed');

        //  update cell data when it's changed
        cellChanged.inputs = activeCell.source;
        cellChanged.outputs = activeCell.outputs;
        cellChanged.inputLines = calCodeLineNum(activeCell.source);
        cellChanged.media = getMedia(cellChanged.no, activeCell.outputs);
        cellChanged.isChanged = true;
        cellChanged.cellType = activeCell.cell_type;
      } else {
        console.log('CellData is not changed');
      }
    }
  }

  loadFromLocalStorage(nb2SlidesStore) {
    if (nb2SlidesStore) {
      this.currentSlideNo = nb2SlidesStore.currentSlideNo;

      this.cells = nb2SlidesStore.cells;
      this.cellsRelation = nb2SlidesStore.cellsRelation;

      this.slides = nb2SlidesStore.slides;
      this.style = nb2SlidesStore.style;
      this.tags = nb2SlidesStore.tags;
    }
  }
}
