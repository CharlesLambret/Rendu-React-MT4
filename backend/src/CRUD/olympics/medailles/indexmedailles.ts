import { Router } from 'express';
import { creatMedal } from './requetes/create';
import { deletMedal } from './requetes/delete';
import { getMedal } from './requetes/read';
import { updatMedal } from './requetes/update';

const indexmedailles = Router();

indexmedailles.use(
 
);

export default indexmedailles;