import { EntityManager, ObjectLiteral, SelectQueryBuilder } from "typeorm"

const overrideFunctions = <T extends object>(self: T) => {
    let prototype = self;
    const propertyNames: (keyof T)[] = [];
  
    while (prototype) {
      propertyNames.push(...Object.getOwnPropertyNames(prototype) as any);
      prototype = Object.getPrototypeOf(prototype);
    }
  
    propertyNames.forEach((propertyName) => {
        try {
            if (self != undefined && self[propertyName] && typeof self[propertyName] === 'function') {
                Object.defineProperty(self, propertyName, {
                    value: () => {
                        throw new Error(`You forgot to mock ${String(propertyName)} in your test!`);
                    },
                    writable: true,
                    configurable: true,
                });
            }
        } catch {} 
    });
  };
  
export class FakeEntityManager extends EntityManager {
    constructor(results: Generator<ObjectLiteral>) {
        try {
            super({} as any)
            overrideFunctions<EntityManager>(this)
            this.createQueryBuilder = () => new FakeSelectQueryBuilder(results)
            this.findOne = async () =>  results.next().value as any
            this.findOneBy = async () =>  results.next().value as any
            this.find = async () => results.next().value as any
            this.remove = async () => []
            this.create = () => new FakeEntity(results.next().value as any, async () => {}) as any
        } catch{}
    }
}

export class FakeSelectQueryBuilder<T extends ObjectLiteral> extends SelectQueryBuilder<T> {
    constructor(results: Generator<ObjectLiteral>) {
            super({
                expressionMap: {
                    clone: () => {}
                } 
            } as any)
            overrideFunctions<SelectQueryBuilder<T>>(this)
            this.leftJoin = () => this
            this.where = () => this
            this.select = () => this
            this.addSelect = () => this
            this.from = () => this
            this.andWhere = () => this
            this.innerJoin = () => this
            this.groupBy = () => this
            this.distinctOn = () => this
            this.leftJoinAndSelect = () => this
            this.having = () => this
            this.getOne = () => Promise.resolve(results.next().value as unknown as T)
            this.getRawOne = () => Promise.resolve(results.next().value as any)
            this.getMany = () => Promise.resolve(results.next().value as unknown as T[])
            this.getRawMany = () => Promise.resolve(results.next().value as unknown as T[]) as any
            this.getQuery = () => ""
    }
}

export class FakeEntity<T> implements ObjectLiteral {
    constructor(public item: T, public save: () => Promise<void>) {
    }
}