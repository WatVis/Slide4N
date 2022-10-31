let frontend;
let backend;

// description: generate `titles` based on user selected cells
// url: /slide/titles
frontend = [
  {
    cellID: 'c-0',
    cellType: 'code or markdown',
    isChosen: { source: true, outputs: false },
    souce:
      "# read data\ntrain = pd.read_csv('../input/titanic/train.csv')\ntest = pd.read_csv('../input/titanic/test.csv')",
    outputs: [
      {
        name: 'stdout',
        text: 'FF\nFF\n',
        output_type: 'stream'
      }
    ]
  }
];
backend = [
  {
    title: 'read data',
    type: 'code or markdown',
    weight: 10,
    isChosen: 'true or false'
  }
];

// description: generate `bullet points` based on user selected cells
// url: /slide/points
frontend = [
  {
    cellID: 'c-0',
    cellType: 'code or markdown',
    isChosen: { source: true, outputs: false },
    souce:
      "# read data\ntrain = pd.read_csv('../input/titanic/train.csv')\ntest = pd.read_csv('../input/titanic/test.csv')",
    outputs: [
      {
        name: 'stdout',
        text: 'FF\nFF\n',
        output_type: 'stream'
      }
    ]
  }
];
backend = [
  {
    cellID: 'c-0',
    bulletID: 'b-0-0', // cellID-index
    bullet: 'read data',
    type: 'code or markdown',
    weight: 10,
    isChosen: 'true or false'
  }
];

// description: `layouts` suggestions based on generated points
// url: /slide/layouts
frontend = [
  {
    cellID: 'c-0',
    order: 0, // corresponding to execution order
    cellType: 'code or markdown',
    souce:
      "# read data\ntrain = pd.read_csv('../input/titanic/train.csv')\ntest = pd.read_csv('../input/titanic/test.csv')",
    outputs: [
      {
        name: 'stdout',
        text: 'FF\nFF\n',
        output_type: 'stream'
      }
    ],
    bullets: [
      {
        bulletID: 'b-0-0',
        bullet: 'read data',
        type: 'code or markdown',
        weight: 10,
        isChosen: true
      }
    ],
    media: [{ mediaID: 'm-0-0', type: 'table or plot', isChosen: true }],
    maxGroup: 3
  }
];
backend = [
  {
    groupSize: 1,
    score: 0.8,
    bullets: [
      {
        bulletID: 'b-0-0',
        isChosen: true,
        groupID: 1
      },
      {
        bulletID: 'b-0-1',
        isChosen: true,
        groupID: 1
      },
      {
        bulletID: 'b-0-2',
        isChosen: false,
        groupID: 1
      }
    ],
    media: [
      { mediaID: 'm-0-0', isChosen: true, groupID: 1 },
      { mediaID: 'm-0-1', isChosen: false, groupID: 1 }
    ],
    backbone: { between: 'layout1', within: ['layout2'] }
  },
  {
    groupSize: 3,
    score: 0.6,
    bullets: [
      {
        bulletID: 'b-0-0',
        isChosen: true,
        groupID: 1
      },
      {
        bulletID: 'b-0-1',
        isChosen: true,
        groupID: 2
      },
      {
        bulletID: 'b-0-2',
        isChosen: true,
        groupID: 3
      }
    ],
    media: [
      { mediaID: 'm-0-0', isChosen: true, groupID: 1 },
      { mediaID: 'm-0-1', isChosen: true, groupID: 2 }
    ],
    backbone: { between: 'layout2', within: ['layout2', 'layout2', 'layout1'] } // the size of `within` shoule be the same as groupSize
  }
];

// description: rcommend `relevant cells` based on user selected cells
// url: /slide/relevant_cells
frontend = [
  {
    cellID: 'c-0',
    cellType: 'code or markdown',
    isChosen: { source: true, outputs: false },
    souce:
      "# read data\ntrain = pd.read_csv('../input/titanic/train.csv')\ntest = pd.read_csv('../input/titanic/test.csv')",
    outputs: [
      {
        name: 'stdout',
        text: 'FF\nFF\n',
        output_type: 'stream'
      }
    ]
  }
];
backend = [
  {
    source: 'c-0-0', // cellID
    target: 'c-0-1',
    weight: 10
  },
  {
    source: 'c-0-0',
    target: 'c-0-2',
    weight: 2
  },
  {
    source: 'c-0-0',
    target: 'c-0-3',
    weight: 5
  }
];
