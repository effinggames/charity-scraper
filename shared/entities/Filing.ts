import { CharityForm990JSON } from 'shared/Types';
import { getOrThrow } from 'shared/Utils';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Charity from './Charity';

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

/**
 * Helper function for saving or updating a new filing.
 * @param charity
 * @param json
 */
export async function saveFiling(charity: Charity, json: CharityForm990JSON): Promise<Filing> {
  const yearStr = getOrThrow(() => json.Return.ReturnHeader.TaxYear);
  const year = parseInt(yearStr, 10);
  const filing = (await Filing.findOne({ charity, year })) || new Filing();

  filing.charity = charity;
  filing.data = json;
  filing.year = year;

  return filing.save();
}
