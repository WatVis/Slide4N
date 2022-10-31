import React, { useEffect, useState, Component } from 'react';

import { observer } from 'mobx-react';
import { action, values } from 'mobx';
import * as _ from 'lodash';
import {
  Input,
  Select,
  Card,
  Tree,
  Slider,
  Button,
  Space,
  Tooltip,
  Checkbox,
  Tag,
  Dropdown,
  Menu,
  MenuProps,
  message,
  Alert,
  AutoComplete,
  Divider,
  Collapse,
  Anchor,
  Switch
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import '../style/index.css'; // active the antd style
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CaretDownOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  DownSquareOutlined,
  EditOutlined,
  FileMarkdownOutlined,
  PlusOutlined,
  SettingOutlined,
  UpOutlined,
  UserOutlined
} from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import Remarkable from 'react-remarkable';
import axios from 'axios';
import { saveAs } from 'file-saver';

import {
  Contraint,
  DropDownItem,
  SlideData,
  SlideMeta,
  SourceType,
  SlideTag,
  Title,
  BulletPoint,
  MarkState,
  SlideLayout,
  ContentUnit,
  BulletPoint4Layout,
  UpdateFromType,
  GroupInfoGL,
  GLPosition,
  GroupInfoGLPointOneByOne,
  MediaData4Slide,
  StyleType,
  TemplateType,
  getMedias4SelectedCells,
  generateLayout,
  URLBase,
  postData,
  TitleState,
  saveToLS,
  getDataByAxios,
  convertCells2TBLAPI,
  convertPointsFromBE,
  convertLayoutsFromBE,
  convertLayoutsFromBEV2,
  APIState
} from './util';

import { NB2SlidesStore } from './store/nb2slides';
import { CodeIcon, ManIcon, MarkdownIcon } from './icon';
import { GridLayout } from '@lumino/widgets';
import { slideTCOneMix, slideTemplateBase } from './slide-templates';
import cells from './data/cells';

export const ControlPanelV2 = observer(
  ({ nb2slidesStore }: { nb2slidesStore: NB2SlidesStore }): JSX.Element => {
    const render = () => {
      const { Panel } = Collapse;

      return (
        <div className="control-panel">
          <Collapse
            defaultActiveKey={['SlideControl', 'Contents']}
            style={{ width: '95%' }}
          >
            <Panel header="Slide Control" key="SlideControl">
              <SlideControlViewV2
                nb2slidesStore={nb2slidesStore}
                slide={nb2slidesStore.currentSlide}
                tags={nb2slidesStore.tags}
                currentTags4Selection={nb2slidesStore.currentTags4Selection}
              />
            </Panel>
            <Panel header="Contents" key="Contents">
              <ContentView
                contentLinks={nb2slidesStore.contentLinksV2}
                nb2slidesStore={nb2slidesStore}
              />
            </Panel>
          </Collapse>
          <div
            style={{
              width: '100%',
              position: 'absolute',
              bottom: 15,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Button
              type="default"
              size="small"
              onClick={() => {
                saveToLS('nb', nb2slidesStore);
                console.log('save', nb2slidesStore);

                // save as local file
                const blob = new Blob([JSON.stringify(nb2slidesStore)], {
                  type: 'text/plain;charset=utf-8'
                });
                saveAs(blob, 'nb.txt');
              }}
            >
              Save
            </Button>
          </div>
        </div>
      );
    };
    return render();
  }
);

const SlideControlViewV2 = observer(
  ({
    nb2slidesStore,
    slide,
    tags,
    currentTags4Selection
  }: {
    nb2slidesStore: NB2SlidesStore;
    slide: SlideData;
    tags: SlideTag[];
    currentTags4Selection: any;
  }) => {
    // 实现滚动到新增页面;
    const scrollToSlide = sldieID => {
      try {
        let anchorElement = document.getElementById(sldieID);

        if (anchorElement) {
          anchorElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }

        console.log('scrollToSlide anchorElement', anchorElement);
      } catch (error) {
        console.log(error);
      }
    };

    // add a slide
    const addTemplateSlide = (type: TemplateType) => {
      try {
        const slideID = 'slide-' + nb2slidesStore.slides.length;
        const newSlide: SlideData = slideTemplateBase(slideID);

        // 根据type设置模板类型
        newSlide.templateType = type;
        if (type == TemplateType.MixOne) {
          newSlide.templateDisplay.push({ id: 1, show: true });
        } else if (type == TemplateType.MixTwo) {
          newSlide.templateDisplay.push({ id: 1, show: true });
          newSlide.templateDisplay.push({ id: 2, show: true });
        } else if (type == TemplateType.OnlyTitles) {
          newSlide.templateDisplay.push({ id: 1, show: true });
          newSlide.templateDisplay.push({ id: 2, show: true });
        }
        console.log('addTemplateSlide newSlide', newSlide, type);

        // update store
        // add a slide
        nb2slidesStore.slides.push(newSlide);

        // make added slide the current one
        nb2slidesStore.updateCurrentSlideNo(UpdateFromType.NewSlide, '');
        // // and jump to it
        setTimeout(() => scrollToSlide(slideID), 100);

        // if store is changed, store a copy in localStorage
        saveToLS('nb', nb2slidesStore);
      } catch (error) {
        console.log(error);
      }
    };

    // deal with tag: select, modify
    // if key > -1, not update tag
    const [tagInput, setTagInput] = useState(slide.tag);
    const [tagSelectKey, setTagSelectKey] = useState('-1');

    const onTagSelect: MenuProps['onClick'] = e => {
      let key = e.key;

      console.log('currentTags4Selection', e, currentTags4Selection, key);
      // 设置状态为：选择，并记录选项
      setTagSelectKey(key);

      // 修改slide.tag
      let index = _.findIndex(currentTags4Selection, o => o.key == key);
      if (index > -1) {
        slide.tag = currentTags4Selection[index].label;
        setIsParaChanged(true);
      }
    };

    const menu4Tags = (
      <Menu onClick={onTagSelect} items={currentTags4Selection} />
    );

    // set audience level
    const handleAudienceLevelChange = (value: number) => {
      slide.constraint.audienceLevel = value;
      setIsParaChanged(true);
    };

    // set detail level
    const handleDetailLevelChange = (value: number) => {
      slide.constraint.detailLevel = value;
      setIsParaChanged(true);
    };

    // handle auto merge
    const handleAutoMergeChange = (value: boolean) => {
      slide.constraint.autoMerge = value;
      setIsParaChanged(true);
    };

    // deal with button: Generate, regenerate
    // set the visibility of tip info
    const [visible, setVisible] = useState(false);
    const [tipInfo, setTipInfo] = useState('');
    // deal with parameter change
    const [isParaChanged, setIsParaChanged] = useState(false);

    const handleClose = () => {
      setVisible(false);
    };

    const buttonState = () => {
      if (slide.state == MarkState.New) {
        return true;
      } else if (
        // AI生成的幻灯片关联的cell数目或内容有修改，更新button名字为update
        slide.state == MarkState.Generated &&
        (nb2slidesStore.isCellContentChanged4CurrentSlide ||
          nb2slidesStore.isCellNumberChange4CurrentSlide ||
          isParaChanged)
      ) {
        return true;
      } else {
        return false;
      }
    };

    const getButtonName = () => {
      if (slide.state == MarkState.New) {
        return 'Generate';
      } else if (
        // AI生成的幻灯片关联的cell数目或内容有修改，更新button名字为update
        slide.state == MarkState.Generated &&
        (nb2slidesStore.isCellContentChanged4CurrentSlide ||
          nb2slidesStore.isCellNumberChange4CurrentSlide ||
          isParaChanged)
      ) {
        return 'Update';
      } else {
        // use for other scinarios

        return 'Generate';
      }
    };

    const check4Generate = () => {
      let isTagOk = slide.tag != '';
      // let isTitleOk = slide.title.title != '';
      let isCellsOk = slide.connectedCells.length > 0;

      if (!isTagOk) {
        setTipInfo('no topic detected');
      }
      // else if (!isTitleOk) {
      //   setTipInfo('no title detected');
      // }
      else {
        setTipInfo('no seleced cells');
      }

      return isTagOk && isCellsOk;
    };

    const generateAndUpdateSlide = genType => {
      if (check4Generate()) {
        // 设置提示信息不显示
        setVisible(false);

        try {
          // 更新slide发送请求的状态
          slide.apiState = APIState.Sending;

          // 构建API数据: 获取对应的cell数据，并过滤markdown类型的cell
          const cellsTemp = _.filter(nb2slidesStore.cells, o => {
            if (_.trim(o.inputs) != '') {
              let index = _.indexOf(slide.connectedCells, o.no);
              if (index > -1 && o.cellType != 'markdown') return true;
              else return false;
            } else {
              return false;
            }
          });
          const cells4Back = convertCells2TBLAPI(cellsTemp);

          // TODO:调用API，接收返回的数据(bullet points, layouts)并处理成需要的形式
          // TODO:备份每一个Bullet point，便于实验比较
          const url = URLBase + '/submit_payload_bullet_layout';
          console.log('generateAndUpdateSlide url', url);

          // data: only cells
          // const data = JSON.parse(JSON.stringify(cells4Back));
          // console.log('generateAndUpdateSlide data', data);

          // data: cells and parameters
          let maxLength = 36;
          if (slide.constraint.detailLevel == 1) {
            maxLength = 5;
          } else if (slide.constraint.detailLevel == 2) {
            maxLength = 8;
          } else {
            maxLength = 36;
          }
          const dataV2 = JSON.parse(
            JSON.stringify({
              // 将用户选择映射为文本长度
              maxLength: maxLength,
              autoMerge: slide.constraint.autoMerge,
              cells: cells4Back
            })
          );
          console.log('generateAndUpdateSlide data', dataV2);
          // const result = getDataByAxios(url, data, 'POST');
          // console.log('generateAndUpdateSlide result', result);

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
              console.log('generateAndUpdateSlide res', res);

              let result = res.data;
              let points = convertPointsFromBE(result.bullets);
              let layouts = convertLayoutsFromBEV2(result.layouts, points);

              // 设置store中当前slide中用户编辑过的内容
              if (genType == 'Update') {
                let manPoints = _.filter(
                  slide.bulletPoints,
                  o => o.type == SourceType.Man
                );

                // 调整points的id，避免冲突
                manPoints.map((item, index) => {
                  item.bulletID = 'b-keep-' + index;
                });

                points = _.concat(manPoints, points);
                console.log('points', points);

                // default use the first layout, update layout with man added bullets
                let manPoints4Layout: BulletPoint4Layout[] = [];
                manPoints.map(item => {
                  manPoints4Layout.push({
                    bulletID: item.bulletID,
                    isChosen: true,
                    groupID: 0
                  });
                });

                // TODO: need to deal with the conflicts between bulletID
                layouts[0].bullets = _.concat(
                  manPoints4Layout,
                  layouts[0].bullets
                );
                // console.log('layouts', layouts);
              }

              // 更新返回的内容
              slide.bulletPoints = points;
              slide.layouts = layouts;
              // base on group info to generate the default gridlayouts
              slide.gridLayouts = generateLayout(slide);
              // track the layout change
              slide.gridLayoutsRecord.layout = generateLayout(slide);

              // 更新slide状态
              slide.state = MarkState.Generated;

              // 更新slide发送请求的状态
              slide.apiState = APIState.Success;

              // set para state
              setIsParaChanged(false);

              // 设置当前slide的medias
              slide.medias = getMedias4SelectedCells(
                slide,
                nb2slidesStore.cells
              );
            })
            .catch(err => {
              console.log(err);

              // 更新slide发送请求的状态
              slide.apiState = APIState.Fail;
            });

          // let points: BulletPoint[] = [
          //   {
          //     cellID: 'c-0',
          //     bulletID: 'b-0-0',
          //     bullet: 'Generate: A',
          //     copy: 'Generate: A',
          //     type: SourceType.Code,
          //     weight: 10,
          //     isChosen: true,
          //     groupID: 1,
          //     groupSize: 1
          //   },
          //   {
          //     cellID: 'c-0',
          //     bulletID: 'b-0-1',
          //     bullet: 'Generate: B',
          //     copy: 'Generate: B',
          //     type: SourceType.Code,
          //     weight: 1,
          //     isChosen: true,
          //     groupID: 1,
          //     groupSize: 1
          //   }
          // ];

          // let layouts: SlideLayout[] = [
          //   {
          //     groupSize: 1,
          //     score: 0.8,
          //     bullets: [
          //       {
          //         bulletID: 'b-0-0',
          //         isChosen: true,
          //         groupID: 1
          //       },
          //       {
          //         bulletID: 'b-0-1',
          //         isChosen: true,
          //         groupID: 1
          //       }
          //     ],
          //     media: [
          //       { mediaID: 'm-4-0', isChosen: true, groupID: 1 },
          //       { mediaID: 'm-5-0', isChosen: true, groupID: 1 }
          //     ]
          //   }
          // ];
        } catch (error) {
          console.log(error);
        }

        // 更新slide.titles
        try {
          nb2slidesStore.updateSlideTitles();
        } catch (error) {
          console.log(error);
        }
      } else {
        setVisible(true);
      }
    };

    const onButtonClick = () => {
      if (slide.state == MarkState.New) {
        try {
          generateAndUpdateSlide('Generate');
        } catch (error) {
          console.log(error);
        }
      } else if (
        slide.state == MarkState.Generated &&
        (nb2slidesStore.isCellContentChanged4CurrentSlide ||
          nb2slidesStore.isCellNumberChange4CurrentSlide ||
          isParaChanged)
      ) {
        try {
          generateAndUpdateSlide('Update');
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log('nothing happens');
      }
    };

    // show views
    const showAddSlide = () => {
      return (
        <Space>
          <Tooltip title="click right buttons to add a slide">
            <PlusOutlined />
          </Tooltip>
          <Tooltip title="generate a slide with AI">
            <Button
              type={
                slide.templateType == TemplateType.AI ? 'primary' : 'default'
              }
              size="large"
              onClick={() => addTemplateSlide(TemplateType.AI)}
            >
              AI
            </Button>
          </Tooltip>
          <Tooltip title="add from template">
            <Button
              type={
                slide.templateType == TemplateType.AI ? 'default' : 'primary'
              }
              icon={isTemplateOn ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setIsTemplateOn(!isTemplateOn)}
              size="large"
            ></Button>
          </Tooltip>
        </Space>
      );
    };

    const [isTemplateOn, setIsTemplateOn] = useState(false);
    const showTemplates = () => {
      if (isTemplateOn) {
        return (
          <Space
            align="start"
            size={[6, 12]}
            wrap
            style={{ minWidth: 210, justifyContent: 'center' }}
          >
            <Tooltip title="Title Slide">
              <div
                className="template-container"
                onClick={() => {
                  addTemplateSlide(TemplateType.OnlyTitles);
                  setIsTemplateOn(false);
                }}
              >
                <div
                  style={{
                    width: '75%',
                    height: '40%',
                    border: '1px dashed'
                  }}
                ></div>
                <div
                  style={{
                    width: '75%',
                    height: '25%',
                    border: '1px dashed'
                  }}
                ></div>
              </div>
            </Tooltip>
            <Tooltip title="Title & Content">
              <div
                className="template-container"
                onClick={() => {
                  addTemplateSlide(TemplateType.MixOne);
                  setIsTemplateOn(false);
                }}
              >
                <div
                  style={{
                    width: '75%',
                    height: '18%',
                    border: '1px dashed'
                  }}
                ></div>
                <div
                  style={{
                    width: '75%',
                    height: '70%',
                    border: '1px dashed'
                  }}
                ></div>
              </div>
            </Tooltip>
            <Tooltip title="Two-column Content">
              <div
                className="template-container"
                onClick={() => {
                  addTemplateSlide(TemplateType.MixTwo);
                  setIsTemplateOn(false);
                }}
              >
                <div
                  style={{
                    width: '75%',
                    height: '18%',
                    border: '1px dashed'
                  }}
                ></div>
                <div
                  style={{
                    width: '75%',
                    height: '70%',
                    display: 'flex'
                  }}
                >
                  <div
                    style={{
                      width: '50%',
                      height: '100%',
                      border: '1px dashed'
                    }}
                  ></div>
                  <div
                    style={{
                      width: '50%',
                      height: '100%',
                      border: '1px dashed'
                    }}
                  ></div>
                </div>
              </div>
            </Tooltip>
            <Tooltip title="Title only">
              <div
                className="template-container"
                onClick={() => {
                  addTemplateSlide(TemplateType.BlankWithTitle);
                  setIsTemplateOn(false);
                }}
              >
                <div
                  style={{
                    width: '75%',
                    height: '18%',
                    border: '1px dashed'
                  }}
                ></div>
                <div style={{ width: '75%', height: '70%' }}></div>
              </div>
            </Tooltip>
            <Tooltip title="Blank">
              <div
                className="template-container"
                onClick={() => {
                  addTemplateSlide(TemplateType.Blank);
                  setIsTemplateOn(false);
                }}
              ></div>
            </Tooltip>
          </Space>
        );
      }
    };

    const showControls = () => {
      if (!isTemplateOn) {
        if (slide.templateType == TemplateType.AI) {
          return (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <Space>
                <Tooltip title="select or input a #topic">
                  <b>Topic</b>
                </Tooltip>
                <Tooltip title={slide.tag}>
                  <Input
                    size="small"
                    type="text"
                    placeholder="select or input a #topic"
                    value={slide.tag}
                    onChange={e => {
                      let value = e.target.value;
                      slide.tag = value;
                      setIsParaChanged(true);

                      setTagInput(value);
                    }}
                    onPressEnter={() => {
                      // 将新tag增加到tags队列
                      let flag = _.findIndex(tags, o => o.tag == tagInput);
                      if (flag == -1) {
                        tags.push({ tag: tagInput, type: SourceType.Man });
                      }

                      if (tagSelectKey != '-1') {
                        // 修改tag
                        // tags[Number(tagSelectKey)].tag = value;
                      }
                    }}
                  />
                </Tooltip>
                <Dropdown overlay={menu4Tags}>
                  <Button
                    type="default"
                    icon={<CaretDownOutlined />}
                    size="small"
                  ></Button>
                </Dropdown>
              </Space>
              {/* <Space align="start" direction="vertical" size={0}>
                <b>Technical Level</b>
                <Space>
                  Low
                  <Slider
                    defaultValue={slide.constraint.audienceLevel}
                    min={0}
                    max={5}
                    style={{ width: 100 }}
                    onChange={value => handleAudienceLevelChange(value)}
                  />
                  High
                </Space>
              </Space> */}
              <Space align="start" direction="vertical" size={0}>
                <b>Auto-merge cells</b>
                <Space>
                  No
                  <Switch
                    // checkedChildren={<CheckOutlined />}
                    // unCheckedChildren={<CloseOutlined />}
                    size="small"
                    checked={slide.constraint.autoMerge}
                    onChange={checked => handleAutoMergeChange(checked)}
                  />
                  Yes
                </Space>
              </Space>
              <Space align="start" direction="vertical" size={0}>
                <b>Level of details</b>
                <Space>
                  Low
                  <Slider
                    value={slide.constraint.detailLevel}
                    min={1}
                    max={3}
                    style={{ width: 100 }}
                    onChange={value => handleDetailLevelChange(value)}
                  />
                  High
                </Space>
              </Space>
              <div
                style={{
                  width: '100%',
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Button
                  type="primary"
                  size="middle"
                  onClick={onButtonClick}
                  disabled={!buttonState()}
                >
                  {getButtonName()}
                </Button>
                {visible ? (
                  <Alert
                    message={tipInfo}
                    type="warning"
                    showIcon
                    closable
                    afterClose={handleClose}
                  />
                ) : (
                  ''
                )}
              </div>
            </div>
          );
        } else {
          return (
            <Space
              align="start"
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Space>
                <Tooltip title="select or input a #topic">
                  <b>Topic</b>
                </Tooltip>
                <Tooltip title={slide.tag}>
                  <Input
                    size="small"
                    type="text"
                    placeholder="select or input a #topic"
                    value={slide.tag}
                    onChange={e => {
                      let value = e.target.value;
                      slide.tag = value;
                      setIsParaChanged(true);

                      setTagInput(value);
                    }}
                    onPressEnter={() => {
                      // 将新tag增加到tags队列
                      let flag = _.findIndex(tags, o => o.tag == tagInput);
                      if (flag == -1) {
                        tags.push({ tag: tagInput, type: SourceType.Man });
                      }

                      if (tagSelectKey != '-1') {
                        // 修改tag
                        // tags[Number(tagSelectKey)].tag = value;
                      }
                    }}
                  />
                </Tooltip>
                <Dropdown overlay={menu4Tags}>
                  <Button
                    type="default"
                    icon={<CaretDownOutlined />}
                    size="small"
                  ></Button>
                </Dropdown>
              </Space>
            </Space>
          );
        }
      }
    };

    const render = (): JSX.Element => {
      return (
        <>
          <Space
            align="center"
            direction="vertical"
            size="middle"
            style={{ width: '100%' }}
          >
            {showAddSlide()}
            {showTemplates()}
            {showControls()}
          </Space>
        </>
      );
    };

    return render();
  }
);

const ContentView = observer(
  ({
    contentLinks,
    nb2slidesStore
  }: {
    contentLinks: ContentUnit[];
    nb2slidesStore: NB2SlidesStore;
  }): JSX.Element => {
    const showNavi = () => {
      if (contentLinks.length > 0) {
        return (
          <Space>
            <b>Navigation</b>
            <Tooltip title="show navigation bar and page num on slides">
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                size="small"
                checked={nb2slidesStore.style.isNaviOn}
                onChange={checked => onNaviChange(checked)}
              />
            </Tooltip>
          </Space>
        );
      }
    };

    const onNaviChange = (checked: boolean) => {
      // console.log(`onNaviChange switch to ${checked}`);
      nb2slidesStore.style.isNaviOn = checked;
    };

    let showContents = () => {
      // console.log('contentLinks', contentLinks);
      if (contentLinks.length > 0) {
        // if store is changed, store a copy in localStorage
        // saveToLS('nb', nb2slidesStore);

        // TODO:锚点高亮未跟谁slide点击
        return (
          <Anchor
            affix={false}
            onClick={(e, link) => onLinkClick(e, link)}
            // getCurrentAnchor={() => nb2slidesStore.currentAnchor}
            style={{
              width: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {contentLinks.map(unit => showUnit(unit))}
          </Anchor>
        );
      }
    };

    let showUnit = (unit: ContentUnit) => {
      const { Link } = Anchor;

      return (
        <Link
          href={'#' + unit.titles[0].id}
          title={<Tag color="default">{unit.tag}</Tag>}
        >
          {unit.titles.map(item => {
            return <Link href={'#' + item.id} title={item.title} />;
          })}
        </Link>
      );
    };

    let onLinkClick = (e, link) => {
      console.log(e, link);
      let slideID = link.href.substring(1);
      console.log(slideID);

      nb2slidesStore.updateCurrentSlideNo(
        UpdateFromType.ClickFromContent,
        slideID
      );
    };

    const showTip = () => {
      if (contentLinks.length == 0) {
        return (
          <div className="flex-center">
            <Alert message="No contents yet" type="info" />
          </div>
        );
      }
    };

    const render = () => {
      return (
        <div style={{ width: '100%' }}>
          {showTip()}
          {contentLinks.length > 0 ? (
            <Space align="start" direction="vertical" size="small">
              {showNavi()}
              {showContents()}
            </Space>
          ) : (
            ''
          )}
        </div>
      );
    };

    return render();
  }
);
