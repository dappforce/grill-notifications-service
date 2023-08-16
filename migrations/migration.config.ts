import { getConfig } from './ormconfig';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env.local` });

const datasource = new DataSource(getConfig());
datasource.initialize().finally();
export default datasource;
