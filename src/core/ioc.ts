import 'reflect-metadata';

const classPool: Array<Function> = [];

export function Injectable(_constructor: Function) {
  let paramsTypes: Array<Function> = Reflect.getMetadata(
    'design:paramtypes',
    _constructor,
  );
  if (classPool.indexOf(_constructor) !== -1) {
    return;
  } else if (paramsTypes.length) {
    paramsTypes.forEach((v, i) => {
      if (v === _constructor) {
        throw new Error('no dep self');
      } else if (classPool.indexOf(v) === -1) {
        throw new Error(`dep ${i}[${(v as any).name}] cannot be injected`);
      }
    });
  }
  classPool.push(_constructor);
}

export function create<T>(_constructor: { new (...args: Array<any>): T }): T {
  let paramsTypes: Array<Function> = Reflect.getMetadata(
    'design:paramtypes',
    _constructor,
  );
  let paramInstances = paramsTypes.map((v, i) => {
    if (classPool.indexOf(v) === -1) {
      throw new Error(`param ${i}[${(v as any).name}] cannot be injected`);
    } else if (v.length) {
      return create(v as any);
    } else {
      return new (v as any)();
    }
  });
  return new _constructor(...paramInstances);
}
