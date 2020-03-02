import Stamper from './Stamper';

export default class Path extends Stamper {

  constructor(attrs = {}) {
    super('use', {
      ...attrs,
      'x': '0',
      'y': '0',
      'width': '100',
      'height': '100'
    });
  }
}
