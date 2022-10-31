// test dynamic add and delete
import React, { useEffect, useState, Component, useRef } from 'react';
// import { WidthProvider, Responsive } from 'react-grid-layout';
import RGL, { WidthProvider } from 'react-grid-layout';

import _ from 'lodash';
// const ResponsiveReactGridLayout = WidthProvider(Responsive);

/**
 * This layout demonstrates how to use a grid with a dynamic number of elements.
 */
export const AddRemoveLayout = () => {
  const [items, setItems] = useState([
    {
      i: 0,
      x: 0,
      y: Infinity,
      w: 2,
      h: 2
    },
    {
      i: 1,
      x: 2,
      y: Infinity,
      w: 2,
      h: 2
    },
    {
      i: 2,
      x: 4,
      y: Infinity,
      w: 2,
      h: 2
    }
  ]);

  const createElement = el => {
    return (
      <div key={el.i} data-grid={el} style={{ backgroundColor: 'gray' }}>
        <span className="text">{el.i}</span>
        <span
          className="remove"
          style={{
            position: 'absolute',
            right: '2px',
            top: 0,
            cursor: 'pointer'
          }}
          onClick={() => onRemoveItem()}
        >
          x
        </span>
      </div>
    );
  };

  const onAddItem = () => {
    setItems(items => [
      ...items,
      {
        i: 3,
        x: 4,
        y: Infinity,
        w: 2,
        h: 2
      }
    ]);
  };

  const onRemoveItem = () => {
    console.log('removing 0');

    setItems([
      {
        i: 1,
        x: 2,
        y: Infinity,
        w: 2,
        h: 2
      },
      {
        i: 2,
        x: 4,
        y: Infinity,
        w: 2,
        h: 2
      }
    ]);
  };

  const onLayoutChange = layout => {
    // this.props.onLayoutChange(layout);
    console.log('layout', layout);
  };

  const render = () => {
    const ReactGridLayout = WidthProvider(RGL);

    return (
      <div>
        <button onClick={onAddItem}>Add Item</button>
        <ReactGridLayout
          cols={12}
          rowHeight={20}
          onLayoutChange={onLayoutChange}
        >
          {_.map(items, el => createElement(el))}
        </ReactGridLayout>
      </div>
    );
  };

  return render();
};
