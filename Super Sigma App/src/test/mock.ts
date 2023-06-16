import { EntityManager, ObjectLiteral, SelectQueryBuilder } from "typeorm"

export class FakeEntityManager extends EntityManager {
    constructor(results: Generator<any>) {
        try {
            super({} as any)
            this.createQueryBuilder = () => new FakeSelectQueryBuilder(results.next())
        } catch{}
    }
}

export class FakeSelectQueryBuilder<T extends ObjectLiteral> extends SelectQueryBuilder<T> {
    constructor(inTheEnd: T) {
            super({
                expressionMap: {
                    clone: () => {}
                } 
            } as any)
            this.leftJoin = () => this
            this.where = () => this
            this.andWhere = () => this
            this.getOne = () => Promise.resolve(inTheEnd)
    }
}