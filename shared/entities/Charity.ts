import { Entity, PrimaryColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import Filing from './Filing';
import { CharityForm990JSON } from 'shared/Types';
import { getOrThrow, getOrElse, mapSafely } from 'shared/Utils';

@Entity()
export default class Charity extends BaseEntity {
  @PrimaryColumn({ length: 9 })
  ein: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  urlSlug?: string;

  @OneToMany(() => Filing, (filing) => filing.charity)
  filings: Filing[];
}

/**
 * Creates or updates the charity in the database.
 * @param json The parsed Form 990 JSON.
 * @returns Returns a promise of the updated database entity.
 */
export function saveCharity(json: CharityForm990JSON): Promise<Charity> {
  const ein = getOrThrow(() => json.Return.ReturnHeader.Filer.EIN);
  const name1 = getOrElse(() => json.Return.ReturnHeader.Filer.Name.BusinessNameLine1, '');
  const name2 = getOrElse(() => json.Return.ReturnHeader.Filer.Name.BusinessNameLine2, '');
  // Gets the full name and capitalizes the first letter of each word.
  const fullName = `${name1} ${name2}`.replace(/([^\W_]+[^\s-]*) */g, (word) => {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
  const urlSlug = mapSafely(fullName, (fullName) =>
    fullName
      .toLowerCase()
      // Replaces all non-alphanumeric characters.
      .replace(/[\W_]+/g, ' ')
      // Replaces all extra white space.
      .replace(/\s+/g, ' ')
      // Limits slug to 47 characters.
      .slice(0, 47)
      // Trims in case it got truncated on a white space character.
      .trim()
      // Replaces remaining white space with dashes.
      .replace(/\s/g, '-')
  );

  const charity = new Charity();

  charity.ein = ein;
  charity.name = fullName;
  charity.urlSlug = urlSlug;

  return charity.save();
}
