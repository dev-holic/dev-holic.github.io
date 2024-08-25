import { Description } from './Description';
import { TeamMemberCount } from './TeamMemberCount';
import { TeamMemberPhoto } from './TeamMemberPhoto';

export const AboutSection = () => {
  return (
    <div>
      <h2 className='p-4 text-center text-9xl font-extrabold'>About Plarium</h2>
      <Description />
      <div>
        <TeamMemberCount />
        <TeamMemberPhoto />
      </div>
      <div className='min-h-dvh'></div>
    </div>
  );
};
