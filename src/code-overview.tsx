import React, { useEffect, useState, Component } from 'react';

import * as d3 from 'd3';
import * as _ from 'lodash';
import { Space, Switch, Tag, Tooltip } from 'antd';
import '../style/index.css'; // active the antd style
import {
  BarChartOutlined,
  CodeOutlined,
  EyeInvisibleOutlined,
  FileMarkdownOutlined
} from '@ant-design/icons';

import { observer } from 'mobx-react';
import * as htmlToImage from 'html-to-image';

import { Cell, CellRelation, CellState, MediaType, SourceType } from './util';
import { CodeIcon, ManIcon, MarkdownIcon } from './icon';
import { NB2SlidesStore } from './store/nb2slides';
import cells from './data/cells';

/**
 * A CodeOverview widget.
 * React 会将以小写字母开头的组件视为原生 DOM 标签
 * state state 是私有的，并且完全受控于当前组件.
 *             组件内部自己管理的变量, 构造函数是唯一可以给 this.state 赋值的地方
 * probs 所有 React 组件都必须保护它们的 props 不被更改
 *       组件外部传入组件内部的变量
 */
@observer
export class CodeOverview extends Component<any, any> {
  constructor(props: any) {
    super(props); // probs: cells

    this.state = {
      isMediaOn: false
    };
  }

  render(): JSX.Element {
    // console.log('1.render');

    const onChange = (checked: boolean) => {
      console.log(`switch to ${checked}`);
    };

    return (
      <div className="code-overview">
        {/* <Switch
          size="default"
          checkedChildren={<BarChartOutlined />}
          unCheckedChildren={<EyeInvisibleOutlined />}
          onChange={onChange}
          style={{ marginTop: '8px' }}
        /> */}
        {this.props.cells != undefined && this.props.cells.length > 0 ? (
          <RectChart
            cells={this.props.cells}
            cellsRelation={this.props.cellsRelation}
            currentSlideNo={this.props.currentSlideNo}
            currentSelectCells={this.props.currentSelectCells}
            nb2slidesStore={this.props.nb2slidesStore}
            navNB={this.props.navNB}
          />
        ) : (
          ''
        )}
      </div>
    );
  }
}

export const svgConfig = {
  width: 85,
  height: 700,
  maxHeight: '100%',
  gap: 6
};

const RectChart = observer(
  ({
    cells,
    cellsRelation,
    currentSlideNo,
    currentSelectCells,
    nb2slidesStore,
    navNB
  }: {
    cells: Cell[];
    cellsRelation: CellRelation[];
    currentSlideNo: number;
    currentSelectCells: number[];
    nb2slidesStore: NB2SlidesStore;
    navNB: Function;
  }) => {
    const [cellNow, setCellNow] = useState(cells?.[0]);

    let selectCells: number[] = currentSelectCells;

    let handleCellSelect = (no: number) => {
      let cellIndex = _.findIndex(cells, function (o) {
        return o.no == no;
      });
      if (cellIndex > -1) {
        let bindIndex = cells[cellIndex].bindToSlides.indexOf(currentSlideNo);
        // do bind
        if (bindIndex == -1) cells[cellIndex].bindToSlides.push(currentSlideNo);
        // unbind
        else {
          _.pullAt(cells[cellIndex].bindToSlides, bindIndex);
        }
      } else {
        console.log("The selected cell don't exist.");
      }
    };

    let drawChartByCells = () => {
      // console.log('RectChart drawChartByCells is on');
      d3.select('#code-overview').select('svg').remove();

      // console.log('cells', cells);
      // console.log('cellsRelation', cellsRelation);

      const svg = d3
        .select('#code-overview')
        .append('svg')
        .style('width', svgConfig.width)
        .style('height', svgConfig.height);

      // 事件处理函数
      // 鼠标悬浮事件
      let mouseover = function (event, bindData) {
        // console.log('mouseover', event, bindData);
        // 控制悬浮框的显示
        setCellNow(bindData);
        tooltip.style('opacity', 1).style('z-index', 10);

        // 控制文本的显示
        // d3.select('#code-overview').selectAll('text').style('opacity', 1);

        // 设置线条样式
        try {
          d3.select('#code-overview')
            .selectAll('path')
            .filter((d, index) => {
              return d.source == bindData.no || d.target == bindData.no;
            })
            .style('stroke', CellState.CurrentOn)
            .style('stroke-width', 2)
            .style('opacity', 1);
        } catch (error) {
          console.log(error);
        }

        // 矩形框描边
        d3.select('#code-overview')
          .selectAll('rect')
          .filter((d, index) => {
            return d.no == bindData.no;
          })
          .style('stroke', CellState.CurrentOn)
          .style('stroke-width', 2);

        // 更细圆点的颜色
        d3.select('#code-overview')
          .selectAll('circle')
          .filter((d, index) => {
            return (
              d.no == bindData.no && _.indexOf(selectCells, bindData.no) == -1
            );
          })
          .style('fill', CellState.CurrentOn);
      };

      // 鼠标移动事件
      let mousemove = function (e, cell) {
        // let html =
        //   cell.inputs != ''
        //     ? '<b>' + cell.cellType + '</b><br>' + cell.inputs
        //     : 'no codes';
        // console.log('html', html);
        tooltip
          // .html(html)
          // .style('left', e.clientX - 50 + 'px')
          .style('left', e.clientX - 50 - 768 + 'px')
          .style('top', e.clientY - 50 + 'px');
      };

      // 鼠标离开事件
      var mouseleave = function (event, bindData) {
        // console.log('mouseleave', event, bindData);
        // 控制悬浮框的显示
        tooltip.style('opacity', 0).style('z-index', -1);

        // 控制文本的显示
        // d3.select('#code-overview').selectAll('text').style('opacity', 0);

        // 设置线条样式
        d3.select('#code-overview')
          .selectAll('path')
          .style('stroke', CellState.Default)
          .style('stroke-width', 1)
          .style('opacity', 0.3);

        // 矩形框描边
        d3.select('#code-overview')
          .selectAll('rect')
          .filter((d, index) => {
            return d.no == bindData.no;
          })
          .style('stroke', CellState.Default)
          .style('stroke-width', 0);

        // 更细圆点的颜色
        d3.select('#code-overview')
          .selectAll('circle')
          .filter((d, index) => {
            return (
              d.no == bindData.no && _.indexOf(selectCells, bindData.no) == -1
            );
          })
          .style('fill', CellState.Default);
      };

      // 单击事件: 显示相关的cell
      let oneclick = function (event, bindData) {
        // enable navi
        navNB(bindData.no);

        // 矩形框上色
        // 恢复默认颜色
        d3.select('#code-overview')
          .selectAll('rect')
          .style('fill', CellState.Default);

        // 高亮当前方块
        d3.select('#code-overview')
          .selectAll('rect')
          .filter((d, index) => {
            return d.no == bindData.no;
          })
          .style('fill', CellState.CurrentOn);

        // 绘制相关色块的颜色
        let relationScale = d3
          .scaleLinear()
          .domain([
            d3.min(cellsRelation, d => d.weight),
            d3.max(cellsRelation, d => d.weight)
          ])
          .range([CellState.RelevantLeft, CellState.RelevantRight]);

        let relateCells = _.filter(cellsRelation, o => {
          return o.source == bindData.no || o.target == bindData.no;
        });

        for (let i = 0; i < relateCells.length; i++) {
          let temp = relateCells[i];
          let drawNo = temp.source == bindData.no ? temp.target : temp.source;
          d3.select('#code-overview')
            .selectAll('rect')
            .filter((d, index) => {
              return d.no == drawNo;
            })
            .style('fill', relationScale(temp.weight));
        }
      };

      // 双击事件: 选择cell
      let dbClick = function (event, bindData) {
        // 改变cell的值
        let no = bindData.no;
        let color = '';
        if (_.indexOf(selectCells, bindData.no) == -1) {
          // 当前cell绑定新的slide
          selectCells.push(no);
          color = CellState.Select;
        } else {
          _.pull(selectCells, no);
          color = CellState.CurrentOn;
        }

        // 更新到store里cell.bindToSlides
        handleCellSelect(no);

        // 更新当前slide的cell数目有变动
        if (nb2slidesStore.currentSlide.bulletPoints.length > 0) {
          nb2slidesStore.isCellNumberChange4CurrentSlide = true;
        }

        // 设置选中节点的颜色
        d3.select('#code-overview')
          .selectAll('circle')
          .filter((d, index) => {
            return d.no == bindData.no;
          })
          .style('fill', color);

        console.log('selectCells', selectCells);
      };

      // 绘制悬浮框
      let tooltip = d3
        .select('#code-overview')
        .select('.code-overview-tooltip')
        // .se.append('div')
        .style('opacity', 0)
        // .attr('class', 'code-overview-tooltip')
        .style('z-index', -1);

      // 绘图辅助函数
      // 计算矩形的y坐标
      let calY = function (i) {
        return (
          _.sumBy(_.slice(cells, 0, i), o => o.inputLines) + i * svgConfig.gap
        );
      };

      // 图形绘制
      const svgWidth = svgConfig.width;
      // console.log('svgWidth', svgWidth);

      // 绘制矩形：导航+标记选择状态
      const rectWidth = svgWidth * 0.7;
      const rectBaseX = 20;

      svg
        .append('g')
        .selectAll('rect')
        .data(cells)
        .enter()
        .append('rect')
        .attr('x', rectBaseX)
        .attr('y', (d, i) => calY(i))
        .attr('width', rectWidth)
        .attr('height', (d, i) => d.inputLines)
        .attr('fill', CellState.Default)
        .on('click', oneclick)
        .on('dblclick', dbClick)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);

      // 绘制cell类型或序号
      const fontSize = 6;
      svg
        .append('g')
        .selectAll('text')
        .data(cells)
        .enter()
        .append('text')
        .attr('x', rectBaseX - 7)
        .attr('y', (d, i) => calY(i) + d.inputLines * 0.5 + fontSize * 1.5)
        // 绘制序号
        // .text((d, i) => i + 1)
        // 绘制cell类型
        .text((d, i) => {
          if (d.cellType == SourceType.Markdown) return '#';
          else return '';
        })
        .style('font-size', fontSize)
        .style('fill', 'darkgray')
        .style('opacity', 1);

      // 绘制线条
      svg
        .append('g')
        .selectAll('path')
        .data(cellsRelation)
        .enter()
        .append('path')
        .attr('d', (d, i) => {
          let souceIndex = _.findIndex(cells, function (o) {
            return o.no == d.source;
          });
          let sourceCell = cells[souceIndex];
          let sourceY = calY(souceIndex) + sourceCell.inputLines * 0.5;

          let targetIndex = _.findIndex(cells, function (o) {
            return o.no == d.target;
          });
          let targetCell = cells[targetIndex];
          let targetY = calY(targetIndex) + targetCell.inputLines * 0.5;

          return [
            'M',
            rectBaseX - 6,
            sourceY,
            'Q',
            -rectBaseX * 0.45,
            (sourceY + targetY) / 2,
            rectBaseX - 6,
            targetY
          ].join(' ');
        })
        .style('fill', 'transparent')
        .style('stroke', CellState.Default)
        .style('stroke-width', 1)
        .style('opacity', 0.3);

      // 绘制点：标记cell状态
      const radius = 3;
      svg
        .append('g')
        .selectAll('circle')
        .data(cells)
        .enter()
        .append('circle')
        .attr('cx', rectBaseX - 6)
        .attr('cy', (d, i) => calY(i) + d.inputLines * 0.5)
        .attr('r', radius)
        .attr('fill', (d, i) => {
          if (selectCells.indexOf(d.no) > -1) return CellState.Select;
          else return CellState.Default;
        })
        .style('stroke', (d, i) => {
          if (d.isChanged) return CellState.Changed;
        });
    };

    useEffect(drawChartByCells, [cells, cellsRelation, currentSelectCells]);

    // 模拟单击事件: 高亮相关的cell
    const highlightRect = () => {
      let activeCell = nb2slidesStore.activeCell;

      // 更细圆点的颜色
      d3.select('#code-overview')
        .selectAll('circle')
        .filter((d, index) => {
          return _.indexOf(selectCells, d.no) == -1;
        })
        .style('fill', CellState.Default);

      d3.select('#code-overview')
        .selectAll('circle')
        .filter((d, index) => {
          return (
            d.no == activeCell.no && _.indexOf(selectCells, activeCell.no) == -1
          );
        })
        .style('fill', CellState.CurrentOn);

      // 设置线条样式
      d3.select('#code-overview')
        .selectAll('path')
        .style('stroke', CellState.Default)
        .style('stroke-width', 1)
        .style('opacity', 0.3);

      try {
        d3.select('#code-overview')
          .selectAll('path')
          .filter((d, index) => {
            return d.source == activeCell.no || d.target == activeCell.no;
          })
          .style('stroke', CellState.CurrentOn)
          .style('stroke-width', 2)
          .style('opacity', 1);
      } catch (error) {
        console.log(error);
      }

      // 矩形框上色
      // 恢复默认颜色
      d3.select('#code-overview')
        .selectAll('rect')
        .style('fill', CellState.Default);

      // 高亮当前方块
      d3.select('#code-overview')
        .selectAll('rect')
        .filter((d, index) => {
          return d.no == activeCell.no;
        })
        .style('fill', CellState.CurrentOn);

      // 绘制相关色块的颜色
      let relationScale = d3
        .scaleLinear()
        .domain([
          d3.min(cellsRelation, d => d.weight),
          d3.max(cellsRelation, d => d.weight)
        ])
        .range([CellState.RelevantLeft, CellState.RelevantRight]);

      let relateCells = _.filter(cellsRelation, o => {
        return o.source == activeCell.no || o.target == activeCell.no;
      });

      for (let i = 0; i < relateCells.length; i++) {
        let temp = relateCells[i];
        let drawNo = temp.source == activeCell.no ? temp.target : temp.source;
        d3.select('#code-overview')
          .selectAll('rect')
          .filter((d, index) => {
            return d.no == drawNo;
          })
          .style('fill', relationScale(temp.weight));
      }
    };

    useEffect(highlightRect, [nb2slidesStore.activeCell]);

    let showIcon = type => {
      if (type == SourceType.Code) {
        return (
          <Tooltip title="Code">
            <Tag
              // icon={<CodeIcon />}
              color="default"
              // style={{ marginRight: 0, width: '100%', textAlign: 'center' }}
            >
              Code cell
            </Tag>
          </Tooltip>
        );
      } else if (type == SourceType.Markdown) {
        return (
          <Tooltip title="Markdown">
            <Tag
              // icon={<MarkdownIcon />}
              color="default"
              // style={{ marginRight: 0, width: '100%', textAlign: 'center' }}
            >
              Markdown cell
            </Tag>
          </Tooltip>
        );
      } else {
        return (
          <Tooltip title="Manual">
            <Tag
              icon={<ManIcon />}
              color="default"
              // style={{ marginRight: 0, width: '100%', textAlign: 'center' }}
            />
          </Tooltip>
        );
      }
    };

    const showIconV2 = type => {
      // console.log(type);

      if (type == 'code') {
        return (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fafafa',
              border: '1px solid #d9d9d9'
            }}
          >
            Code cell
          </div>
        );
      } else if (type == 'markdown') {
        return (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fafafa',
              border: '1px solid #d9d9d9'
            }}
          >
            Markdown cell
          </div>
        );
      } else {
        return (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fafafa',
              border: '1px solid #d9d9d9'
            }}
          >
            Code cell
          </div>
        );
      }
    };

    let showCodes = codes => {
      return (
        <div
          className="code-overview-tooltip-codes"
          dangerouslySetInnerHTML={{
            __html: codes != '' ? codes : ''
          }}
        ></div>
      );
    };

    let showMedia = medias => {
      if (medias != undefined && medias.length > 0) {
        let media = medias[0];
        if (media.type == MediaType.Plot) {
          return (
            <img
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              src={media.media}
            />
          );
        } else {
          return (
            <div
              dangerouslySetInnerHTML={{
                __html: media.media
              }}
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                color: 'black',
                backgroundColor: 'white'
              }}
            ></div>
          );
        }
      }
    };

    return (
      <>
        <div id="code-overview" style={{ paddingTop: 5 }}>
          {/* svg will be drawn here */}
          <div className="code-overview-tooltip">
            {cellNow != undefined ? showIconV2(cellNow.cellType) : ''}
            {cellNow != undefined ? showCodes(cellNow.inputs) : ''}
            {cellNow != undefined ? showMedia(cellNow.media) : ''}
          </div>
        </div>
      </>
    );
  }
);
