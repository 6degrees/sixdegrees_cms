import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsProject extends Struct.ComponentSchema {
  collectionName: 'components_sections_projects';
  info: {
    displayName: 'Project';
  };
  attributes: {
    background: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    cards: Schema.Attribute.Component<'ui.card', true>;
    category: Schema.Attribute.Component<'ui.category', false>;
    client_ar: Schema.Attribute.String;
    client_en: Schema.Attribute.String;
    date: Schema.Attribute.Date;
    description_ar: Schema.Attribute.Text;
    description_en: Schema.Attribute.Text;
    industry: Schema.Attribute.Component<'ui.industry', false>;
    page_layout: Schema.Attribute.Enumeration<['one', 'two', 'three', 'four']>;
    swiber: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    thumbnail: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title_ar: Schema.Attribute.String;
    title_en: Schema.Attribute.String;
  };
}

export interface UiCard extends Struct.ComponentSchema {
  collectionName: 'components_ui_cards';
  info: {
    displayName: 'Card';
  };
  attributes: {
    description_ar: Schema.Attribute.Text;
    description_en: Schema.Attribute.Text;
    images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    layout: Schema.Attribute.Enumeration<['default']> &
      Schema.Attribute.DefaultTo<'default'>;
    subtitle_ar: Schema.Attribute.String;
    subtitle_en: Schema.Attribute.Text;
    title_ar: Schema.Attribute.String;
    title_en: Schema.Attribute.String;
  };
}

export interface UiCategory extends Struct.ComponentSchema {
  collectionName: 'components_ui_category_s';
  info: {
    displayName: 'Category ';
  };
  attributes: {
    name_ar: Schema.Attribute.String;
    name_en: Schema.Attribute.String;
  };
}

export interface UiIndustry extends Struct.ComponentSchema {
  collectionName: 'components_ui_industry_s';
  info: {
    displayName: 'Industry ';
  };
  attributes: {
    name_ar: Schema.Attribute.String;
    name_en: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'sections.project': SectionsProject;
      'ui.card': UiCard;
      'ui.category': UiCategory;
      'ui.industry': UiIndustry;
    }
  }
}
