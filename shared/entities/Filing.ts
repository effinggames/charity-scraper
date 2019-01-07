import { CharityForm990JSON } from 'shared/Types';
import { getOrThrow } from 'shared/Utils';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import Charity from './Charity';

@Entity()
export default class Filing extends BaseEntity {
  // Combination of charity EIN + filing year.
  // Helps prevent duplicate filings.
  // e.g. 555555555-1999
  @PrimaryColumn({ length: 14 })
  einYear: string;

  @ManyToOne(() => Charity, (charity) => charity.filings, { onDelete: 'CASCADE' })
  charity: Charity;

  @Column('jsonb')
  data: CharityForm990JSON;

  /**
   * Helper function for creating a new filing.
   * @param charity Charity to use as foreign key.
   * @param json The Form 990 JSON.
   * @returns Returns a promise for the saved filing.
   */
  static createFiling(charity: Charity, json: CharityForm990JSON): Filing {
    const ein = getOrThrow(() => json.Return.ReturnHeader.Filer.EIN);
    const yearStr = getOrThrow(() => json.Return.ReturnHeader.TaxYear);
    const year = parseInt(yearStr, 10);
    const einYear = `${ein}-${year}`;
    const filing = new Filing();

    filing.einYear = einYear;
    filing.charity = charity;
    filing.data = json;

    return filing;
  }
}
