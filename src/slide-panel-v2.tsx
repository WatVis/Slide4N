import React, { useEffect, useState, Component, useRef } from 'react';

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
  Image,
  Switch,
  Divider,
  Spin
} from 'antd';
import type { InputRef } from 'antd';
import type { DataNode } from 'antd/es/tree';
import '../style/index.css'; // active the antd style
import {
  AppleOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  DragOutlined,
  EditOutlined,
  EyeOutlined,
  FileAddOutlined,
  FileMarkdownOutlined,
  FormOutlined,
  MinusCircleOutlined,
  MinusOutlined,
  PictureOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  UndoOutlined,
  UserOutlined
} from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import Remarkable from 'react-remarkable';
import {
  // support list drag and drop
  DragDropContext,
  Droppable,
  Draggable as DraggableB
} from 'react-beautiful-dnd';

import {
  Contraint,
  DropDownItem,
  SlideData,
  SlideMeta,
  SourceType,
  SlideTag,
  Title,
  BulletPoint,
  Position,
  MarkState,
  SlideLayout,
  BulletPoint4Layout,
  MediaData,
  Media4Layout,
  MediaType,
  Cell,
  LayoutGroup,
  GLPosition,
  GroupInfoGL,
  ContentUnit,
  UpdateFromType,
  GroupInfoGLPointOneByOne,
  MediaData4Slide,
  getImagefromClipboard,
  insertImageFromClipboard,
  TemplateType,
  TitleState,
  TemplateDisplay,
  APIState
} from './util';
import { observer } from 'mobx-react';
import { action, values } from 'mobx';
import { NB2SlidesStore } from './store/nb2slides';
import Draggable from 'react-draggable';
import { CodeIcon, ManIcon, MarkdownIcon } from './icon';
import { assign } from 'mobx/dist/internal';
import RGL, { WidthProvider } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';

export const SlidePanelV2 = observer(
  ({ nb2slidesStore }: { nb2slidesStore: NB2SlidesStore }): JSX.Element => {
    // const [counter, setCounter] = useState(0);
    const render = () => {
      return (
        <div className="slide-panel">
          {nb2slidesStore.slides.map((slideItem, index) => {
            try {
              if (slideItem.state != MarkState.Deleted) {
                return (
                  <SlideDeck
                    currentOn={nb2slidesStore.currentSlideNo == index}
                    slide={slideItem}
                    slides={nb2slidesStore.slides}
                    contentLinks={nb2slidesStore.contentLinksV2}
                    nb2slidesStore={nb2slidesStore}
                  />
                );
              }
            } catch (error) {
              console.log(error);
            }
          })}
          {nb2slidesStore.slides.map((slideItem, index) => {
            try {
              if (slideItem.state == MarkState.Deleted) {
                return (
                  <SlideDeck
                    currentOn={nb2slidesStore.currentSlideNo == index}
                    slide={slideItem}
                    slides={nb2slidesStore.slides}
                    contentLinks={nb2slidesStore.contentLinksV2}
                    nb2slidesStore={nb2slidesStore}
                  />
                );
              }
            } catch (error) {
              console.log(error);
            }
          })}
        </div>
      );
    };

    return render();
  }
);

const SlideDeck = observer(
  ({
    currentOn,
    slides,
    slide,
    contentLinks,
    nb2slidesStore
  }: {
    currentOn: boolean;
    slides: SlideData[];
    slide: SlideData;
    contentLinks: ContentUnit[];
    nb2slidesStore: NB2SlidesStore;
  }): JSX.Element => {
    const [buttonOn, setButtonOn] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // 控制button的显示
    let handleButtonOn = visible => {
      setButtonOn(visible);
    };

    // 右键菜单
    const handleContextMenuClick = e => {
      // console.log('handleContextMenuClick', e);

      if (e.type === 'contextmenu') {
        // 避免鼠标右键默认事件
        e.preventDefault();
        // 设置鼠标点击位置
        setPosition({
          // left: e.clientX - 30,
          left: e.clientX - 50 - 768,
          top: e.clientY - 50
        });
        // 设置按钮组的显示
        setButtonOn(true);
      }
    };

    // 单击事件: 隐藏右键菜单、更新CurrentSlideNo
    let handleClick = () => {
      setButtonOn(false);

      nb2slidesStore.updateCurrentSlideNo(
        UpdateFromType.ClickFromSlide,
        slide.id
      );
    };

    // 控制插入point
    const [isAddingBullet, setIsAddingBullet] = useState(false);
    let showAddBulletView = () => {
      if (isAddingBullet) {
        return (
          <AddBulletView
            bulletPoints={slide.bulletPoints}
            gridLayouts={slide.gridLayouts}
            position={position}
            handleAddNewBulletBox={handleAddNewBulletBox}
          />
        );
      }
    };
    let handleAddNewBulletBox = visible => {
      setIsAddingBullet(visible);
    };

    // 设置slide状态
    let showSlideState = () => {
      if (slide.state == MarkState.Deleted) {
        return (
          <>
            <div
              style={{ position: 'absolute', right: 10, top: 10, zIndex: 5 }}
            >
              <Tag icon={<DeleteOutlined />} color="warning">
                Deleted
              </Tag>
            </div>
            <div className="mask-effect"></div>
          </>
        );
      }
    };

    const isTitleEditOn = () => {
      if (
        // slide.templateType == TemplateType.AI ||
        slide.templateType == TemplateType.MixOne ||
        slide.templateType == TemplateType.MixTwo ||
        slide.templateType == TemplateType.BlankWithTitle
      ) {
        if (slide.title.title == '') return true;
        else return false;
      } else return false;
    };

    const showNavi = () => {
      if (nb2slidesStore.style.isNaviOn) {
        if (slide.tag != '' && slide.title.title != '') {
          return (
            <NavigationBarV2 slideID={slide.id} contentLinks={contentLinks} />
          );
        }
      }
    };

    const render = () => {
      return (
        <div
          id={slide.id}
          className={currentOn ? 'slide-deck active' : 'slide-deck'}
          onClick={() => handleClick()}
          onContextMenu={e => handleContextMenuClick(e)}
        >
          <TitleViewV2 slide={slide} editOn={isTitleEditOn()} />
          {/* Button一个一个显示，使用grid layout定位，响应不同模板 */}
          <SlideDeckMediumGLPointOneByOneUpdate4Template slide={slide} />
          {showNavi()}
          {/* 按钮组 */}
          <SlideButton
            nb2slidesStore={nb2slidesStore}
            slides={slides}
            slide={slide}
            buttonOn={buttonOn}
            position={position}
            handleButtonOn={handleButtonOn}
            handleAddNewBulletBox={handleAddNewBulletBox}
          />
          {showAddBulletView()}
          {showSlideState()}
        </div>
      );
    };

    return render();
  }
);

const SlideDeckMediumGLPointOneByOneUpdate4Template = observer(
  ({ slide }: { slide: SlideData }): JSX.Element => {
    // 控制当前组件的paste功能是否可用，同时用于记录slide上面模板框的数目
    const [pasteFlag, setPasteFlag] = useState(() => {
      if (slide.templateType == TemplateType.MixOne) return 1;
      else if (slide.templateType == TemplateType.MixTwo) return 2;
      else return 0;
    });
    const handleSetPasteFlag = () => {
      setPasteFlag(pasteFlag - 1);
    };

    const showPointsOnebyOne = () => {
      if (slide.bulletPoints.length > 0) {
        return slide.bulletPoints.map(point => {
          try {
            if (
              !(
                point.type == MarkState.NotChosen ||
                point.type == MarkState.Deleted ||
                point.type == MarkState.Template
              ) &&
              point.bullet != ''
            ) {
              return (
                <div key={point.bulletID}>
                  <SingleBullet4SlideSimpleMode
                    bullet={point}
                    editType="textarea"
                    slide={slide}
                  />
                </div>
              );
            }
          } catch (error) {
            console.log(error);
          }
        });
      }
    };

    const showMedia = () => {
      if (slide.medias.length > 0) {
        return slide.medias.map(mediaItem => {
          if (
            !(
              mediaItem.state == MarkState.NotChosen ||
              mediaItem.state == MarkState.Deleted
            )
          )
            return (
              <div key={mediaItem.mediaID}>
                <SingleMedia4GL media={mediaItem} />
              </div>
            );
        });
      }
    };

    const showTipInfo = () => {
      let tipInfo = () => {
        if (slide.apiState == APIState.Default) {
          return 'Select relevant cells, configure the parameters, and refine the generated slide';
        } else if (slide.apiState == APIState.Sending) {
          return 'Generating now, please wait...';
        } else if (slide.apiState == APIState.Success) {
          return 'Successfully generated';
        } else if (slide.apiState == APIState.Fail) {
          return 'Fail to generate, please try again';
        } else {
          return 'Select cells and generate a slide from Slide Control';
        }
      };

      if (
        slide.templateType == TemplateType.AI &&
        slide.state == MarkState.New
      ) {
        return (
          <div
            className="flex-center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              background: 'white'
              // opacity: 0.8
            }}
          >
            <Spin spinning={slide.apiState == APIState.Sending}>
              <Alert
                message={tipInfo()}
                // description={tipInfo()}
                type={slide.apiState == APIState.Fail ? 'warning' : 'info'}
                showIcon
                style={{ height: 60 }}
              />
            </Spin>
          </div>
        );
      } else if (
        slide.templateType == TemplateType.AI &&
        slide.state == MarkState.Generated &&
        (slide.apiState == APIState.Sending || slide.apiState == APIState.Fail)
      ) {
        return (
          <div
            className="flex-center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              background: 'white',
              opacity: 0.8
            }}
          >
            <Spin spinning={slide.apiState == APIState.Sending}>
              <Alert
                message={tipInfo()}
                // description={tipInfo()}
                type={slide.apiState == APIState.Fail ? 'warning' : 'info'}
                showIcon
                style={{ height: 60 }}
                closable
                onClose={() => {
                  slide.apiState = APIState.Default;
                }}
              />
            </Spin>
          </div>
        );
      }
    };

    const showTemplateInfo = () => {
      if (slide.templateType != TemplateType.AI) {
        const slideType = slide.templateType;
        if (slideType == TemplateType.OnlyTitles) {
          return (
            <>
              <TemplatePlaceholderView
                bulletPoints={slide.bulletPoints}
                medias={slide.medias}
                gridLayouts={slide.gridLayouts}
                glPosition={{ i: '', x: 3, y: 3, w: 6, h: 2 }}
                position={{
                  top: '15%',
                  left: '10%',
                  width: '80%',
                  height: '35%'
                }}
                display={slide.templateDisplay[0]}
                eidtOn={true}
                mediaOn={false}
                handleSetPasteFlag={() => handleSetPasteFlag()}
              />
              <TemplatePlaceholderView
                bulletPoints={slide.bulletPoints}
                medias={slide.medias}
                gridLayouts={slide.gridLayouts}
                glPosition={{ i: '', x: 3, y: 6, w: 6, h: 1.5 }}
                position={{
                  top: '52%',
                  left: '10%',
                  width: '80%',
                  height: '25%'
                }}
                display={slide.templateDisplay[1]}
                eidtOn={true}
                mediaOn={false}
                handleSetPasteFlag={() => handleSetPasteFlag()}
              />
            </>
          );
        } else if (slideType == TemplateType.MixOne) {
          return (
            <TemplatePlaceholderView
              bulletPoints={slide.bulletPoints}
              medias={slide.medias}
              gridLayouts={slide.gridLayouts}
              glPosition={{ i: '', x: 1, y: 0, w: 10, h: 12 }}
              position={{ top: '3%', left: '10%', width: '80%', height: '90%' }}
              display={slide.templateDisplay[0]}
              eidtOn={true}
              mediaOn={true}
              handleSetPasteFlag={() => handleSetPasteFlag()}
            />
          );
        } else if (slideType == TemplateType.MixTwo) {
          return (
            <>
              <TemplatePlaceholderView
                bulletPoints={slide.bulletPoints}
                medias={slide.medias}
                gridLayouts={slide.gridLayouts}
                glPosition={{ i: '', x: 1, y: 0, w: 4.5, h: 12 }}
                position={{
                  top: '3%',
                  left: '10%',
                  width: '39%',
                  height: '90%'
                }}
                display={slide.templateDisplay[0]}
                eidtOn={true}
                mediaOn={true}
                handleSetPasteFlag={() => handleSetPasteFlag()}
              />
              <TemplatePlaceholderView
                bulletPoints={slide.bulletPoints}
                medias={slide.medias}
                gridLayouts={slide.gridLayouts}
                glPosition={{ i: '', x: 6, y: 0, w: 4.5, h: 12 }}
                position={{
                  top: '3%',
                  right: '10%',
                  width: '39%',
                  height: '90%'
                }}
                display={slide.templateDisplay[1]}
                eidtOn={true}
                mediaOn={true}
                handleSetPasteFlag={() => handleSetPasteFlag()}
              />
            </>
          );
        } else {
          return <></>;
        }
      }
    };

    const updateLayouts = layout => {
      if (layout.length > 0 && slide.gridLayouts.length == 0) {
        // try to deal with when generating layouts don't consider all the options
        slide.gridLayouts = layout;
        slide.gridLayoutsRecord.layout = layout;
      } else {
        layout.map(item => {
          let index = _.findIndex(slide.gridLayouts, o => o.i == item.i);
          if (index > -1) {
            slide.gridLayouts[index].x = item.x;
            slide.gridLayouts[index].y = item.y;
            slide.gridLayouts[index].w = item.w;
            slide.gridLayouts[index].h = item.h;
          }
        });
      }
    };

    const render = () => {
      const ReactGridLayout = WidthProvider(RGL);

      return (
        <div
          className="slide-deck-medium"
          onPaste={evt => {
            if (pasteFlag == 0) {
              insertImageFromClipboard(
                evt,
                slide.medias,
                undefined,
                slide.gridLayouts
              );
            }
          }}
        >
          <ReactGridLayout
            isBounded={true}
            // verticalCompact={
            //   slide.templateType != TemplateType.AI ? false : true
            // }
            cols={12}
            rowHeight={20}
            layout={slide.gridLayouts}
            onLayoutChange={layout => {
              // console.log('ReactGridLayout', layout);
              // TODO:update grid layout info into store
              updateLayouts(layout);

              // track layout adjust count
              slide.gridLayoutsRecord.adjustCount += 1;
            }}
            // adjust the drag and drop more easier by limitting the height and delete verticalCompact
            verticalCompact={false}
            draggableHandle=".draggable-handle"
            allowOverlap={true}
            style={{ height: '100%' }}
          >
            {showPointsOnebyOne()}
            {showMedia()}
          </ReactGridLayout>
          {showTipInfo()}
          {showTemplateInfo()}
        </div>
      );
    };

    return render();
  }
);

const SingleBullet4SlideSimpleMode = observer(
  ({
    bullet,
    editType,
    slide
  }: {
    bullet: BulletPoint;
    editType: string;
    slide: SlideData;
  }): JSX.Element => {
    const [editOn, setEditOn] = useState(false);
    const [inputText, setInputText] = useState(bullet.bullet);
    const [selectOn, setSelectOn] = useState(false);

    let showCheck = () => {
      return (
        <Checkbox defaultChecked={true} onChange={e => onCheckChange(e)} />
      );
    };

    let onCheckChange = (e: CheckboxChangeEvent) => {
      console.log(`checked = ${e.target.checked}`);
      if (e.target.checked) bullet.type = MarkState.Chosen;
      else bullet.type = MarkState.NotChosen;
    };

    let showIcon = () => {
      if (bullet.type == SourceType.Code) {
        return (
          <Tooltip title="Code">
            <Tag
              icon={<CodeIcon />}
              color="default"
              style={{ marginRight: 0 }}
            />
          </Tooltip>
        );
      } else if (bullet.type == SourceType.Markdown) {
        return (
          <Tooltip title="Markdown">
            <Tag
              icon={<MarkdownIcon />}
              color="default"
              style={{ marginRight: 0 }}
            />
          </Tooltip>
        );
      } else {
        return (
          <Tooltip title="Manual">
            <Tag
              icon={<ManIcon />}
              color="default"
              style={{ marginRight: 0 }}
            />
          </Tooltip>
        );
      }
    };

    let showText = () => {
      return (
        <div className="draggable-handle" style={{ cursor: 'all-scroll' }}>
          <Remarkable source={bullet.bullet} />
        </div>
      );
    };

    let showEdit = () => {
      const { TextArea } = Input;

      if (editType == 'textarea') {
        return (
          <div
            // className="draggable-handle"
            style={{ width: '80%', cursor: 'all-scroll' }}
          >
            <TextArea
              style={{ width: '100%' }}
              autoSize
              // rows={2}
              value={inputText}
              placeholder={
                inputText == '' ? 'input something' : 'adjust the point'
              }
              onChange={e => handleInputChange(e)}
              onPressEnter={() => {
                // setEditOn(false);
              }}
            />
          </div>
        );
      } else {
        return (
          <div
            className="draggable-handle"
            style={{ width: '100%', cursor: 'all-scroll' }}
          >
            <Input
              style={{ minWidth: 200 }}
              size="small"
              type="text"
              placeholder={
                inputText == '' ? 'input something' : 'adjust the point'
              }
              value={inputText}
              onChange={e => handleInputChange(e)}
              onPressEnter={() => {
                // setEditOn(false);
              }}
            />
          </div>
        );
      }
    };

    let handleInputChange = e => {
      setInputText(e.target.value);
    };

    const [buttonOn, setButtonOn] = useState(false);

    const showConfirm = () => {
      if (!editOn) {
        if (buttonOn) {
          return (
            <Tooltip title="edit">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                onClick={() => setEditOn(true)}
              />
            </Tooltip>
          );
        }
      } else {
        return (
          <Tooltip title="done">
            <Button
              type="primary"
              shape="circle"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleConfrim()}
            />
          </Tooltip>
        );
      }
    };

    const handleConfrim = () => {
      // update with the store
      if (inputText != bullet.bullet) {
        bullet.bullet = inputText;

        if (inputText == '') {
          bullet.type = MarkState.Deleted;
        } else {
          bullet.type = SourceType.Man;
        }
      }

      setEditOn(false);
    };

    // edit point by dbclick
    const handleDoubleClick = () => {
      if (editOn) {
        // update with the store
        if (inputText != bullet.bullet) {
          bullet.bullet = inputText;

          if (inputText == '') {
            bullet.type = MarkState.Deleted;
          } else {
            bullet.type = SourceType.Man;
          }
        }

        setEditOn(false);
      } else {
        setEditOn(true);
      }
    };

    // 支持悬浮显示下拉菜单添加相关的points
    const showPointsSelect = () => {
      if (selectOn && slide.layouts.length > 0) {
        try {
          const groupID = _.find(
            slide.layouts[0].bullets,
            o => o.bulletID == bullet.bulletID
          ).groupID;

          const relevantPointIDs = _.filter(
            slide.layouts[0].bullets,
            o => o.groupID == groupID
          );

          const relevantPoints = _.filter(slide.bulletPoints, o => {
            let index = _.findIndex(
              relevantPointIDs,
              item => item.bulletID == o.bulletID
            );
            if (
              index > -1 &&
              (o.type == MarkState.NotChosen ||
                o.type == MarkState.Deleted ||
                o.type == MarkState.Template)
            )
              return true;
            else return false;
          });

          const { Option } = Select;

          if (relevantPoints.length > 0) {
            return (
              <Select
                placeholder="select a relevant point"
                size="small"
                onChange={bulletID => handleSelectChange(bulletID)}
              >
                {relevantPoints.map(item => {
                  return <Option value={item.bulletID}>{item.bullet}</Option>;
                })}
              </Select>
            );
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    const handleSelectChange = (bulletID: string) => {
      try {
        // 更新point的状态为选中
        _.find(slide.bulletPoints, item => item.bulletID == bulletID).type =
          MarkState.Chosen;

        // 更新该point的glposition
        const gl4ThisPoint: GLPosition = _.find(
          slide.gridLayouts,
          o => o.i == bullet.bulletID
        );
        const gl4SelectedPoint: GLPosition = _.find(
          slide.gridLayouts,
          o => o.i == bulletID
        );

        gl4SelectedPoint.x = gl4ThisPoint.x;
        gl4SelectedPoint.y = gl4ThisPoint.y + 1;
      } catch (error) {
        console.log(error);
      }
    };

    // 支持定点拖拽
    const [dragOn, setDragOn] = useState(false);

    let showDragIcon = () => {
      if (dragOn) {
        return (
          <div
            className="draggable-handle"
            style={{ position: 'absolute', right: 20 }}
          >
            <DragOutlined />
          </div>
        );
      }
    };

    const render = () => {
      return (
        <div
          className="single-point"
          // onDoubleClick={() => handleDoubleClick()}
          onMouseEnter={() => {
            setButtonOn(true);
            setSelectOn(true);
            // setDragOn(true);
          }}
          onMouseLeave={() => {
            setButtonOn(false);
            setSelectOn(false);
            // setDragOn(false);
          }}
        >
          {/* <Space align="start" direction="vertical" size="small"> */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8
            }}
          >
            {editOn ? (
              // <Space size="small">
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingRight: 12
                }}
              >
                {showIcon()}
                {showEdit()}
                {showConfirm()}
              </div>
            ) : (
              // </Space>
              // <Space size="small" style={{ paddingRight: 12 }}>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingRight: 12
                }}
              >
                {buttonOn ? showCheck() : ''}
                {showText()}
                {showConfirm()}
              </div>
              // </Space>
            )}
            {showPointsSelect()}
          </div>
          {/* </Space> */}
          {/* {showDragIcon()} */}
        </div>
      );
    };

    return render();
  }
);

const SingleMedia4GL = observer(
  ({ media }: { media: MediaData4Slide }): JSX.Element => {
    let [buttonOn, setButtonOn] = useState(false);

    let showMedia = () => {
      if (media.type == MediaType.Plot) {
        return (
          <div
            className="draggable-handle"
            style={{ width: '100%', cursor: 'all-scroll' }}
          >
            <img
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              src={media.media}
            />
          </div>
        );
      } else {
        return (
          <div
            className="draggable-handle"
            dangerouslySetInnerHTML={{
              __html: media.media
            }}
            style={{
              cursor: 'all-scroll',
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'hidden'
            }}
          ></div>
        );
      }
    };

    let showDeleteButton = () => {
      if (buttonOn) {
        return (
          <div style={{ position: 'absolute', right: 10, top: 10 }}>
            <Tooltip title="remove media">
              <Button
                type="primary"
                shape="circle"
                icon={<CloseOutlined />}
                size="small"
                onClick={() => (media.state = MarkState.NotChosen)}
              />
            </Tooltip>
          </div>
        );
      }
    };

    let showDragIcon = () => {
      if (buttonOn) {
        return (
          <div
            className="draggable-handle"
            style={{ position: 'absolute', right: 10, bottom: 10 }}
          >
            <DragOutlined />
          </div>
        );
      }
    };

    return (
      <div
        className="slide-deck-medium-box"
        onMouseEnter={() => {
          setButtonOn(true);
        }}
        onMouseLeave={() => {
          setButtonOn(false);
        }}
      >
        {showMedia()}
        {showDeleteButton()}
        {/* {showDragIcon()} */}
      </div>
    );
  }
);

const TitleViewV2 = observer(
  ({ slide, editOn }: { slide: SlideData; editOn: boolean }): JSX.Element => {
    const [isEditing, setIsEditing] = useState(editOn);
    const [buttonOn, setButtonOn] = useState(false);
    const [inputText, setInputText] = useState(slide.title.title);

    let showText = () => {
      const { TextArea } = Input;

      if (isEditing) {
        // 根据请求的标题设置初始值
        if (slide.title.apiState == APIState.Success) {
          setInputText(slide.title.title);
          slide.title.apiState = APIState.Default;
        }
        return (
          <TextArea
            style={{ minWidth: 200 }}
            autoSize
            // <Input
            // size="small"
            placeholder={
              slide.title.title == ''
                ? 'click to input a title'
                : 'adjust the title'
            }
            value={inputText}
            onChange={e => handleInputChange(e)}
            // onPressEnter={() => updateTitle()}
          />
        );
      } else {
        if (slide.title.title != '')
          return (
            <Tooltip title={slide.title.title}>
              <h2
                style={{
                  padding: '0 8px',
                  borderBottom: '2px solid gray',
                  maxWidth: 450,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {slide.title.title}
              </h2>
            </Tooltip>
          );
      }
    };

    let handleInputChange = e => {
      setInputText(e.target.value);
    };

    const updateTitle = () => {
      setIsEditing(false);
      slide.title.title = inputText;

      if (slide.title.title != slide.title.original) {
        slide.title.state = TitleState.Man;
      }

      if (slide.title.title == '') {
        // update title state
        slide.title.original = '';
        slide.title.state = TitleState.Man;
      }
    };

    let showButton = () => {
      if (buttonOn) {
        if (!isEditing) {
          return (
            <Tooltip title="edit">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="small"
                onClick={() => setIsEditing(true)}
              />
            </Tooltip>
          );
        } else {
          return (
            <Tooltip title="done">
              <Button
                type="primary"
                shape="circle"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => updateTitle()}
              />
            </Tooltip>
          );
        }
      }
    };

    const showSelect = () => {
      const { Option } = Select;

      if (slide.titles.length > 0 && buttonOn) {
        return (
          <Select
            placeholder="select a title"
            size="small"
            onChange={value => handleSelectChange(value)}
            style={{ minWidth: 175 }}
          >
            {slide.titles.map(item => {
              return <Option value={item.title}>{item.title}</Option>;
            })}
          </Select>
        );
      }
    };

    const handleSelectChange = (value: string) => {
      if (isEditing) {
        // when editing
        setInputText(value);
        slide.title.original = value;
        slide.title.state = TitleState.AI;
      } else {
        // when not editing: update title state
        setInputText(value);
        slide.title.title = value;
        slide.title.original = value;
        slide.title.state = TitleState.AI;
      }
    };

    return (
      <>
        <div
          className="slide-title"
          onMouseEnter={() => {
            setButtonOn(true);
          }}
          onMouseLeave={() => {
            setButtonOn(false);
          }}
        >
          <Space size={12}>
            {showText()}
            {showButton()}
            {showSelect()}
          </Space>
        </div>
      </>
    );
  }
);

const NavigationBarV2 = observer(
  ({
    slideID,
    contentLinks
  }: {
    slideID: string;
    contentLinks: ContentUnit[];
  }): JSX.Element => {
    const showNavi = () => {
      // 寻找当前页面，便于设置高亮
      let slidesNum = 0;
      let slideIndex: number = -1;
      let groupSize: number = -1;
      let tagIndex = _.findIndex(contentLinks, unit => {
        // 计算总页数
        slidesNum += unit.titles.length;

        // 计算当前页面所在组的index及组的大小
        let i = _.findIndex(unit.titles, o => o.id == slideID);
        if (i > -1) {
          slideIndex = i;
          groupSize = unit.titles.length;
          return true;
        } else {
          return false;
        }
      });

      let pageNum = () => {
        let pageNum = 0;
        for (let i = 0; i < tagIndex; i++) {
          pageNum += contentLinks[i].titles.length;
        }
        pageNum = pageNum + slideIndex + 1;

        return pageNum;
      };

      if (slideIndex > -1) {
        return (
          <div className="slide-footer">
            <div className="slide-footer-navi">
              {contentLinks.map((item, index) => {
                return (
                  <div
                    style={{
                      width: (item.titles.length / slidesNum) * 100 + '%',
                      backgroundColor: 'gray',
                      marginRight: 3
                    }}
                  >
                    <div
                      style={{
                        width: ((slideIndex + 1) / groupSize) * 100 + '%',
                        backgroundColor: index == tagIndex ? '#a0ccf8' : 'gray',
                        lineHeight: '30px',
                        textAlign: 'center',
                        fontWeight: index == tagIndex ? 'bold' : 'unset',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Tooltip title={item.tag}>{item.tag}</Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="slide-footer-num">{pageNum()}</div>
          </div>
        );
      }
    };

    return <>{showNavi()}</>;
  }
);

const SlideButton = observer(
  ({
    nb2slidesStore,
    slides,
    slide,
    buttonOn,
    position,
    handleButtonOn,
    handleAddNewBulletBox
  }: {
    nb2slidesStore: NB2SlidesStore;
    slides: SlideData[];
    slide: SlideData;
    buttonOn: boolean;
    position: Position;
    handleButtonOn: Function;
    handleAddNewBulletBox: Function;
  }): JSX.Element => {
    // TODO: make the button work
    let insertPoint = () => {
      console.log('click insert text box');
      handleAddNewBulletBox(true);
    };

    let mediaFlag = () => {
      let flag = false;
      slide.medias.map(item => {
        if (
          item.state == MarkState.Deleted ||
          item.state == MarkState.NotChosen
        )
          flag = true;
      });
      return flag;
    };
    let recoverMedia = () => {
      slide.medias.map(item => {
        item.state = MarkState.Chosen;
      });
    };

    let moveSlideUp = () => {
      let index = _.findIndex(slides, o => o.id == slide.id);
      console.log('moveSlideUp', index);

      if (index > 0) {
        let tempSlide = slides[index - 1];
        slides[index - 1] = slides[index];
        slides[index] = tempSlide;
      }
    };

    let moveSlideDown = () => {
      let index = _.findIndex(slides, o => o.id == slide.id);
      console.log('moveSlideDown', index);

      if (-1 < index && index < slides.length - 1) {
        let tempSlide = slides[index];
        slides[index] = slides[index + 1];
        slides[index + 1] = tempSlide;
      }
    };

    let move2recycle = () => {
      slide.state = MarkState.Deleted;
    };

    let recoverSlide = () => {
      slide.state = MarkState.Chosen;
    };

    let deleteSlide = () => {
      if (slide.state == MarkState.Deleted) {
        try {
          let index = _.findIndex(slides, o => o.id == slide.id);

          if (index > -1) {
            // 更新当前操作页面
            nb2slidesStore.updateCurrentSlideNo(
              UpdateFromType.DeleteSlide,
              index
            );

            // 删除
            slides = _.pullAt(slides, index);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    const showDelete = () => {
      if (slide.state != MarkState.Deleted) {
        return (
          <>
            <Tooltip title="move slide to recycle bin">
              <Button
                type="primary"
                shape="circle"
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => move2recycle()}
              />
            </Tooltip>
          </>
        );
      } else {
        return (
          <>
            <Tooltip title="recover slide">
              <Button
                type="primary"
                shape="circle"
                icon={<UndoOutlined />}
                size="small"
                onClick={() => recoverSlide()}
              />
            </Tooltip>
            {slides.length > 1 ? (
              <Tooltip title="delete slide">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => deleteSlide()}
                />
              </Tooltip>
            ) : (
              ''
            )}
          </>
        );
      }
    };

    let showButton = () => {
      if (buttonOn) {
        return (
          <div
            className="slide-button"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left
            }}
          >
            <Space align="start" direction="vertical" size={5}>
              <Tooltip title="insert a point">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<FormOutlined />}
                  size="small"
                  onClick={() => insertPoint()}
                />
              </Tooltip>
              {mediaFlag() ? (
                <Tooltip title="recover media">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<PictureOutlined />}
                    size="small"
                    onClick={() => recoverMedia()}
                  />
                </Tooltip>
              ) : (
                ''
              )}
              <Tooltip title="move slide up">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CaretUpOutlined />}
                  size="small"
                  onClick={() => moveSlideUp()}
                />
              </Tooltip>
              <Tooltip title="move slide down">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CaretDownOutlined />}
                  size="small"
                  onClick={() => moveSlideDown()}
                />
              </Tooltip>
              {showDelete()}
            </Space>
          </div>
        );
      }
    };

    return <>{showButton()}</>;
  }
);

const AddBulletView = observer(
  ({
    bulletPoints,
    gridLayouts,
    position,
    handleAddNewBulletBox
  }: {
    bulletPoints: BulletPoint[];
    gridLayouts: GLPosition[];
    position: Position;
    handleAddNewBulletBox: Function;
  }): JSX.Element => {
    const [newPoint, setNewPoint] = useState('');

    // input a new point
    const enterNewItem = () => {
      // interact with store
      // add new bullet into store
      let bulletID = 'b-man-' + bulletPoints.length;
      let newBullet: BulletPoint = {
        cellID: 'none',
        bulletID: bulletID,
        bullet: newPoint,
        type: SourceType.Man,
        weight: 10,

        isChosen: true,
        groupID: 1,
        groupSize: 1
      };
      bulletPoints.push(newBullet);

      // TODO: update layouts based on the position of mouse
      let leftMost = 12;
      let widthMin = 12;
      let yBottom = 0;

      let hasMedia = _.findIndex(gridLayouts, o => o.i.indexOf('m') > -1);
      if (hasMedia > -1) {
        gridLayouts.map(item => {
          if (item.i.indexOf('m') == -1) {
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
        i: bulletID,
        x: leftMost == 12 ? 1 : leftMost,
        y: yBottom + 1,
        w: widthMin > 6 ? 6 : widthMin,
        h: 1
      };

      // gridLayouts = _.concat(gridLayouts, newGLLayout);
      gridLayouts.push(newGLLayout);
      // console.log('+ gridLayouts', gridLayouts);

      // clear input
      setNewPoint('');

      // hidden input box
      handleAddNewBulletBox(false);
    };

    // select from no used bullets
    let selectFlag = () => {
      let flag = false;
      bulletPoints.map(point => {
        if (
          point.type == MarkState.NotChosen ||
          point.type == MarkState.Deleted
        )
          flag = true;
      });
      return flag;
    };
    const handleSelectChange = (value: string) => {
      console.log(`selected ${value}`);

      let index = _.findIndex(bulletPoints, o => o.bulletID == value);
      if (index > -1) {
        bulletPoints[index].type = MarkState.Chosen;
      }

      // hidden input box
      handleAddNewBulletBox(false);
    };

    const render = () => {
      const { Option } = Select;
      const { TextArea } = Input;

      return (
        <div
          className="slide-add-bullet"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: 300
          }}
        >
          {/* <Space align="start" direction="vertical" size={10}> */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 10
            }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {/* <Input
              size="small"
              type="text"
              placeholder="enter a new point"
              value={newPoint}
              onChange={e => {
                setNewPoint(e.target.value);
              }}
              onPressEnter={enterNewItem}
              style={{ minWidth: 175 }}
            /> */}
              <TextArea
                // autoSize={{ minRows: 2 }}
                rows={3}
                value={newPoint}
                placeholder="click to input"
                onChange={e => {
                  setNewPoint(e.target.value);
                }}
                style={{ width: '90%' }}
              />
              <Tooltip title="insert now">
                <Button
                  type="primary"
                  size="small"
                  shape="circle"
                  icon={<CheckOutlined />}
                  onClick={() => enterNewItem()}
                />
              </Tooltip>
            </div>
            {/* select points */}
            {selectFlag() ? (
              <Select
                defaultValue="select a point"
                size="small"
                onChange={value => handleSelectChange(value)}
                style={{ width: '90%' }}
              >
                {bulletPoints.map(point => {
                  if (
                    point.type == MarkState.NotChosen ||
                    point.type == MarkState.Deleted
                  )
                    return (
                      <Option value={point.bulletID}>{point.bullet}</Option>
                    );
                })}
              </Select>
            ) : (
              ''
            )}
          </div>
          {/* </Space> */}
        </div>
      );
    };

    return render();
  }
);

const TemplatePlaceholderView = observer(
  ({
    bulletPoints,
    medias,
    gridLayouts,
    glPosition,
    position,
    display,
    eidtOn,
    mediaOn,
    handleSetPasteFlag
  }: {
    bulletPoints: BulletPoint[];
    medias: MediaData4Slide[];
    gridLayouts: GLPosition[];
    glPosition: GLPosition;
    position: Position;
    display: TemplateDisplay;
    eidtOn: boolean;
    mediaOn: boolean;
    handleSetPasteFlag: Function;
  }): JSX.Element => {
    const [displayFlag, setDisplayFlag] = useState(display.show);
    const [newPoint, setNewPoint] = useState('');

    // input a new point
    const enterNewItem = () => {
      // delete from dom
      setDisplayFlag(false);
      // not render after refreshing
      display.show = false;
      // allow parent to paste image, 模板框数目减少1
      handleSetPasteFlag();

      // interact with store
      // add new bullet into store
      let bulletID = 'b-man-' + bulletPoints.length;
      let newBullet: BulletPoint = {
        cellID: 'none',
        bulletID: bulletID,
        bullet: newPoint,
        type: SourceType.Man,
        weight: 10,

        isChosen: true,
        groupID: 1,
        groupSize: 1
      };
      bulletPoints.push(newBullet);

      // TODO: update layouts based on the position of mouse
      if (glPosition != undefined) {
        glPosition.i = bulletID;
        gridLayouts.push(glPosition);
      } else {
        let leftMost = 12;
        let widthMin = 12;
        let yBottom = 0;

        let hasMedia = _.findIndex(gridLayouts, o => o.i.indexOf('m') > -1);
        if (hasMedia > -1) {
          gridLayouts.map(item => {
            if (item.i.indexOf('m') == -1) {
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
          i: bulletID,
          x: leftMost == 12 ? 1 : leftMost,
          y: yBottom + 1,
          w: widthMin > 6 ? 6 : widthMin,
          h: 1
        };
        gridLayouts.push(newGLLayout);
      }
    };

    // paste image
    const pasteMedia = evt => {
      // delete from dom
      setDisplayFlag(false);
      // not render after refreshing
      display.show = false;
      // allow parent to paste image, 模板框数目减少1
      handleSetPasteFlag();

      insertImageFromClipboard(evt, medias, glPosition, gridLayouts);
    };

    const showView = () => {
      const { TextArea } = Input;

      if (displayFlag) {
        return (
          <div
            onPaste={evt => {
              if (mediaOn) pasteMedia(evt);
            }}
            style={{
              padding: 10,
              position: 'absolute',
              border: '1px dashed',
              zIndex: 5,
              background: 'white',
              ...position
            }}
          >
            {eidtOn ? (
              <div className="slide-template-edit">
                <TextArea
                  rows={3}
                  value={newPoint}
                  placeholder="click to input"
                  onChange={e => {
                    setNewPoint(e.target.value);
                  }}
                  style={{ width: '90%', minWidth: 200 }}
                />
                <Tooltip title="insert now">
                  <Button
                    type="primary"
                    size="small"
                    shape="circle"
                    icon={<CheckOutlined />}
                    onClick={() => enterNewItem()}
                  />
                </Tooltip>
              </div>
            ) : (
              ''
            )}
            {mediaOn ? (
              <div className="slide-template-media">
                <PictureOutlined style={{ fontSize: 20 }} />
                <div>Paste to insert image</div>
              </div>
            ) : (
              ''
            )}
          </div>
        );
      }
    };

    const render = () => {
      return <>{showView()}</>;
    };

    return render();
  }
);
