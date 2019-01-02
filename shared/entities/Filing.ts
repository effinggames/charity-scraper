import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, Index } from 'typeorm';
import Charity from './Charity';
import { getOrThrow } from 'shared/Utils';
import { CharityForm990JSON } from 'shared/Types';

@Entity()
export default class Filing extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Charity, (charity) => charity.filings)
  charity: Charity;

  @Column('jsonb')
  data: CharityForm990JSON;

  @Column()
  year: number;
}

export async function saveFiling(charity: Charity, json: CharityForm990JSON): Promise<Filing> {
  const yearStr = getOrThrow(() => json.Return.ReturnHeader.TaxYear);
  const year = parseInt(yearStr, 10);
  const filing = (await Filing.findOne({ charity, year })) || new Filing();

  filing.charity = charity;
  filing.data = json;
  filing.year = year;

  return filing.save();
}
