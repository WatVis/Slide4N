import { ReactWidget } from '@jupyterlab/apputils';

import React, { useEffect, useState, Component } from 'react';
import * as _ from 'lodash';
import { Button, Space } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { saveAs } from 'file-saver';
import axios from 'axios';

import {
  Cell,
  SlideMeta,
  SlideData,
  SourceType,
  saveToLS,
  getFromLS,
  MediaType,
  MarkState,
  getImagefromClipboard,
  URLBase,
  getDataByAxios
} from './util';
import { CodeOverview } from './code-overview';
import { NB2SlidesStore } from './store/nb2slides';
import { ControlPanelV2 } from './slide-control-v2';
import { SlidePanelV2 } from './slide-panel-v2';
import dataRecord from './data/study';

/**
 * A NB2Slides widget.
 */
// init store here and set in constructor
// const nb2slidesStore = new NB2SlidesStore();

export class NB2SlidesWrapper extends ReactWidget {
  nb2slidesStore: NB2SlidesStore;
  navNBCb?: Function;
  getNBCell?: Function;
  timerID: number;

  constructor() {
    super();

    // init the store
    this.nb2slidesStore = new NB2SlidesStore();

    // load store from LocalStorage if exists
    const ls = getFromLS('nb');
    console.log('get from ls', ls);
    if (ls) {
      try {
        this.nb2slidesStore.loadFromLocalStorage(ls);
      } catch (error) {
        console.log(error);
      }
    }

    // // get from record data
    // console.log('get from record', dataRecord);
    // if (!ls && dataRecord) {
    //   try {
    //     this.nb2slidesStore.loadFromLocalStorage(dataRecord);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }

    // 初始化第一页slide
    this.nb2slidesStore.setFirstSlide();

    this.addClass('nbstory-widget');

    // add timer
    this.timerID = 0;
  }

  // enable communication with notebook
  // set cells from notebook for store
  setCells2Store(cells: Cell[]) {
    console.log('setCells2Store', cells);
    this.nb2slidesStore.cells = cells;
    // 计算cell间的相关性
    this.nb2slidesStore.setCellsRelation();
  }

  // set active cell to store
  setActiveCell2Store(cell) {
    this.nb2slidesStore.activeCell = cell;
  }

  // update when cell data is changed
  updateCellDataWhenChanged(activeCell, activeCellIndex) {
    this.nb2slidesStore.updateCellData(activeCell, activeCellIndex);
  }

  // set active cell to jump
  setNavNBCb(cb: Function) {
    this.navNBCb = cb;
  }

  // get cell with index
  setGetNBCell(cb: Function) {
    this.getNBCell = cb;
  }

  render(): JSX.Element {
    // return <NB2Slides cells={this.props.cells}></NB2Slides>;
    return (
      <>
        {/* <Button onClick={() => this.nb2slidesStore.updateSlideTitles()}>
          testTitles
        </Button>
        <Button onClick={() => this.nb2slidesStore.setCellsRelation()}>
          testRelevant
        </Button> */}
        {/* <Button
          onClick={() => {
            const getData = () => {
              // const url = 'http://127.0.0.1:5000' + '/nb';
              const url = 'http://34.123.183.29:3000/test';
              console.log('url', url);
              // const data = JSON.parse(JSON.stringify(this.nb2slidesStore.cells));
              const data = '';
              console.log('data', data);

              // deal with data in callback
              axios({
                url: url,
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json;charset=utf-8',
                  'Access-Control-Allow-Origin': '*'
                },
                data: data
              })
                .then(res => {
                  console.log('res', res);
                })
                .catch(err => {
                  console.log(err);
                });

              // deal with data with async and await
              // const result = getDataByAxios(url, data, 'POST');
              // console.log(result);
            };

            this.timerID = setInterval(getData, 3 * 60 * 1000);
            console.log('setInterval', this.timerID);
          }}
        >
          testAPI
        </Button>
        <Button
          onClick={() => {
            console.log('clearInterval', this.timerID);
            clearInterval(this.timerID);
          }}
        >
          clearInterval
        </Button> */}
        {/* <Button
          onClick={() => {
            console.log('save', this.nb2slidesStore);
            saveToLS('nb', this.nb2slidesStore);
          }}
        >
          save
        </Button>
        <Button
          onClick={() => {
            const ls = getFromLS('nb');
            console.log('get from ls', ls);
            if (ls) {
              try {
                this.nb2slidesStore.loadFromLocalStorage(ls);
              } catch (error) {
                console.log(error);
              }
            }
          }}
        >
          get
        </Button> */}
        <NB2SlidesV2
          nb2slidesStore={this.nb2slidesStore}
          navNB={this.navNBCb}
        />
      </>
    );
  }
}

const viewSize = {
  width: '1300px',
  height: '930px'
};

const NB2SlidesV2 = observer(
  ({
    nb2slidesStore,
    navNB
  }: {
    nb2slidesStore: NB2SlidesStore;
    navNB: Function | undefined;
  }): JSX.Element => {
    // if store is changed, store a copy in localStorage
    // useEffect(() => {
    //   saveToLS('nb', nb2slidesStore);
    //   console.log('save', nb2slidesStore);

    //   // save as local file
    //   // const blob = new Blob([JSON.stringify(nb2slidesStore)], {
    //   //   type: 'text/plain;charset=utf-8'
    //   // });
    //   // saveAs(blob, 'nb.txt');
    // });

    const render = (): JSX.Element => {
      return (
        <div className="main-layout">
          <CodeOverview
            cells={nb2slidesStore.cells}
            cellsRelation={nb2slidesStore.cellsRelation}
            currentSlideNo={nb2slidesStore.currentSlideNo}
            currentSelectCells={nb2slidesStore.currentSlide.connectedCells}
            nb2slidesStore={nb2slidesStore}
            navNB={navNB}
          />
          <ControlPanelV2 nb2slidesStore={nb2slidesStore} />
          <SlidePanelV2 nb2slidesStore={nb2slidesStore} />
        </div>
      );
    };

    return render();
  }
);
