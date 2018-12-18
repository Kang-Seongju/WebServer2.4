var Nest_function = [
  {
    func:'TargetTemp',
    input:true
  },
  {
    func:'CurrentTemp',
    input:false
  },
  {
    func:'TargetTempType',
    input:true
  }
];
var SmartThings_function = [
  {
    func:'Switch',
    input:false
  },
  {
    func:'DoorStatus',
    input:false
  },
  {
    func:'MotionDetect',
    input:false
  }
]

var Foobot_function = [
  {
    func: 'Status',
    input:false
  }
];
var WeMo_function = [
  {
    func: 'Power',
    input:true
  }
];

var Lockitron_function = [
  {
    func:'Power',
    input:true
  }
];

var Lamp_function = [
  {
    func:'Brightness',
    input:true
  },
  {
    func:'Color',
    input:true
  },
  {
    func:'Power',
    input:true
  }
]

var Plug_function = [
  {
    func:'Power',
    input:true
  },
  {
    func:'Status',
    input:false
  }
]

var Sensor_function = [
  {
    func:'Status',
    input:false
  }
]

var DEVICE = [
  {
    name:'WeMo-Switch',
    obj:WeMo_function
  },
  {
    name:'Nest',
    obj:Nest_function
  },
  {
    name:'SmartThings',
    obj:SmartThings_function
  },
  {
    name:'Foobot',
    obj:Foobot_function
  },
  {
    name:'AJ-Lamp',
    obj:Lamp_function
  },
  {
    name:'Hue-Lamp',
    obj:Lamp_function
  },
  {
    name:'AJ-Plug',
    obj:Plug_function
  },
  {
    name:'Sensor',
    obj:Sensor_function
  },
  {
    name:'Lockitron',
    obj:Lockitron_function
  }
]

// console.log(DEVICE);