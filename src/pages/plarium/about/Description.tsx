import styles from './Description.module.scss';

export const Description = () => {
  return (
    <div>
      <div className='flex px-10 pb-44 pt-20'>
        <div className='pr-4 pt-12'>
          <p className='pb-6 text-2xl'>
            RAID: Shadow Legends, Mech Arena, and 20 other titles have made Plarium one of the most
            successful game companies in the world.
          </p>
          <p className='pb-6 text-xl opacity-80'>
            We create free-to-play mobile and computer games that are regularly featured on the App
            Store and Google Play.
          </p>
          <p className='text-xl opacity-80'>
            Our teams collaborate with Hollywood stars, famous streamers, competitive players, and
            gamers from around the world.
          </p>
        </div>
        <div>
          <div className={`${styles.card} ml-20 flex h-40 w-60 items-center justify-center`}>
            <img
              className='w-32'
              src='https://cdn-company.plarium.com/meet/production/media/assets/images/AboutSection_Raid.webp'
            />
          </div>
          <div className={`${styles.card} -mt-7 flex h-40 w-60 items-center justify-center`}>
            <img
              className='w-32'
              src='https://cdn-company.plarium.com/meet/production/media/assets/images/AboutSection_Mech.webp'
            />
          </div>
          <div className={`${styles.card} -mt-7 ml-20 flex h-40 w-60 items-center justify-center`}>
            <img
              className='w-32'
              src='https://cdn-company.plarium.com/meet/production/media/assets/images/AboutSection_MergeGardens.webp'
            />
          </div>
        </div>
      </div>
    </div>
  );
};
